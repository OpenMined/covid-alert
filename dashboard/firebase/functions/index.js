const express = require("express");
const cors = require("cors");
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const paillier = require("paillier-bigint");
const { gps2box, stringifyBigInt, parseBigInt } = require("gps-sector-grid");

const serviceAccount = require("./coronavirus-mapper-firebase-adminsdk-i6ree-699f4198bb.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://coronavirus-mapper.firebaseio.com"
});

const db = admin.firestore();

const gridTensorComputation = async (req, res) => {
  let { sectorKey, gridTensor, publicKey } = parseBigInt(req.body);

  publicKey = new paillier.PublicKey(publicKey.n, publicKey.g);

  // Only work with locations of patients in the last 72 hours
  const recency = Date.now() - 259200000; // 259200000ms === 72 hours
  const recencyDate = admin.firestore.Timestamp.fromDate(new Date(recency));

  // Get all matching locations
  const matchingLocations = await db
    .collectionGroup("locations")
    .where("sector_key", "==", sectorKey)
    .where("last_time", ">=", recencyDate)
    .get();

  // If we have one or more matching locations...
  if (matchingLocations.size >= 1) {
    // An array for holding the resulting grid tensors of all multiplications on patientLocations, summed together
    let eOverlapGridTensor;

    // For each confirmed location in this sector in the last 72 hours
    for (let doc of matchingLocations.docs) {
      // eslint-disable-next-line no-await-in-loop
      const patient = await doc.ref.parent.parent.get();

      // Get the patient who was at this location
      const patientData = patient.data();

      // If they've been verified by an authority
      if (patientData.verified) {
        // Get the data for that location
        const location = doc.data();

        // Convert the patient's lat and lng to a flattened gridTensor
        const convertedLocation = gps2box(location.lat, location.lng);
        const patientGridTensor = [].concat(...convertedLocation.gridTensor);

        // Multiply that against the grid tensor from the user
        let eMulVal = [];

        for (let i = 0; i < gridTensor.length; i++) {
          eMulVal.push(publicKey.multiply(gridTensor[i], patientGridTensor[i]));
        }

        if (eOverlapGridTensor) {
          // If eOverlapGridTensor already has a value, add it to the new eMulVal
          const tempEOverlapGridTensor = [];

          for (let i = 0; i < gridTensor.length; i++) {
            tempEOverlapGridTensor.push(
              publicKey.addition(eOverlapGridTensor[i], eMulVal[i])
            );
          }

          eOverlapGridTensor = tempEOverlapGridTensor;
        } else {
          // If eOverlapGridTensor isn't set yet, set it to eMulVal
          eOverlapGridTensor = eMulVal;
        }
      }
    }

    // Send the resulting tensor
    return res.send({ result: stringifyBigInt(eOverlapGridTensor) });
  }

  // We have no matches
  return res.send(JSON.stringify({ matches: false }));
};

// Declare an Express.js app
const app = express();

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));

// Build our routes
app.post("/grid-tensor-computation", gridTensorComputation);

// Expose Express API as a single Cloud Function:
exports.api = functions.https.onRequest(app);

// Create a patient record on creation of a non-admin user
exports.createPatient = functions.auth.user().onCreate(user => {
  const isAdminUser = /^[\w.+-]+@(un\.org|who\.int)$/.test(user.email);

  if (!isAdminUser) {
    db.collection("patients")
      .doc(user.uid)
      .set({
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        verified: false
      });
  }
});
