const express = require('express');
const cors = require('cors');
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const paillier = require('paillier-bigint');
// const paillier = require('paillier-pure');
const { gps2box, stringifyBigInt, parseBigInt } = require('gps-sector-grid');

const serviceAccount = require('./coronavirus-mapper-firebase-adminsdk-i6ree-699f4198bb.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://coronavirus-mapper.firebaseio.com'
});

// Connect to our database
const db = admin.firestore();

// The main computation endpoint
const gridTensorComputation = async (req, res) => {
  // Get the sectorKey, gridTensor, and publicKey values from the request
  let { sectorKey, gridTensor, publicKey } = parseBigInt(req.body);

  // Generate a public key identical to that given to us by the user
  publicKey = new paillier.PublicKey(publicKey.n, publicKey.g);

  // This is a number which will hold the result of adding all the products computed below together
  // If there are not matching and patient verified location, we simply return this value unaltered
  let finalEVal = publicKey.encrypt(0);

  // Only work with locations of patients in the last 72 hours
  const recency = Date.now() - 259200000; // 259200000ms === 72 hours
  const recencyDate = admin.firestore.Timestamp.fromDate(new Date(recency));

  // Get all matching locations
  const matchingLocations = await db
    .collectionGroup('locations')
    .where('sector_key', '==', sectorKey)
    .where('last_time', '>=', recencyDate)
    .get();

  // If we have one or more matching locations...
  if (matchingLocations.size >= 1) {
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

        // Create a value to store the product of gridTensor values and patientGridTensor values
        let eMulVal = [];

        // Multiply the gridTensor values and patientGridTensor values
        for (let i = 0; i < gridTensor.length; i++) {
          eMulVal.push(publicKey.multiply(gridTensor[i], patientGridTensor[i]));
        }

        // Add all those numbers togther and store them in finalEVal
        for (let i = 0; i < eMulVal.length; i++) {
          finalEVal = publicKey.addition(finalEVal[i], eMulVal[i]);
        }
      }
    }
  }

  // Send the result
  return res.send(stringifyBigInt({ result: finalEVal }));
};

// Declare an Express.js app
const app = express();

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));

// Build our routes
app.post('/grid-tensor-computation', gridTensorComputation);

// Expose Express API as a single Cloud Function:
exports.api = functions.https.onRequest(app);

// Create a patient record on creation of a non-admin user
exports.createPatient = functions.auth.user().onCreate(user => {
  const isAdminUser = /^[\w.+-]+@(un\.org|who\.int)$/.test(user.email);

  if (!isAdminUser) {
    db.collection('patients')
      .doc(user.uid)
      .set({
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        verified: false
      });
  }
});
