const express = require('express');
const cors = require('cors');
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const paillier = require('paillier-bigint');
const { gps2box, stringifyBigInt, parseBigInt } = require('gps-sector-grid');

const serviceAccount = require('./coronavirus-mapper-firebase-adminsdk-i6ree-699f4198bb.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://coronavirus-mapper.firebaseio.com'
});

const db = admin.firestore();

const gridTensorComputation = async (req, res) => {
  let { sectorKey, gridTensor, publicKey } = parseBigInt(req.body);

  publicKey = new paillier.PublicKey(publicKey.n, publicKey.g);

  db.collectionGroup('locations')
    .where('sector_key', '==', sectorKey)
    .get()
    .then(snapshot => {
      if (snapshot.size >= 1) {
        // An array for holding the resulting grid tensors of all multiplications on patientLocations, summed together
        let eOverlapGridTensor;

        // For each confirmed location in this sector
        snapshot.forEach(doc => {
          // Get the data for that location
          const location = doc.data();

          // Convert the patient's lat and lng to a flattened gridTensor
          const convertedLocation = gps2box(location.lat, location.lng);
          const patientGridTensor = [].concat(...convertedLocation.gridTensor);

          console.log('PATIENT GRID TENSOR', patientGridTensor);
          console.log('FLATTENED PATIENT GRID TENSOR', patientGridTensor);

          // Multiply that against the grid tensor from the user
          let eMulVal = [];

          for (let i = 0; i < gridTensor.length; i++) {
            eMulVal.push(
              publicKey.multiply(gridTensor[i], patientGridTensor[i])
            );
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
        });

        // Send the resulting tensor
        return res.send({ result: stringifyBigInt(eOverlapGridTensor) });
      }

      return res.send(JSON.stringify({ matches: false }));
    })
    .catch(error => {
      console.log(`Could not perform lookup on sector ${sectorKey}`, error);

      return res.send(JSON.stringify({ matches: false }));
    });
};

const app = express();

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));

// Build our routes
app.post('/sector-match', sectorMatch);
app.post('/grid-tensor-computation', gridTensorComputation);

// Expose Express API as a single Cloud Function:
exports.api = functions.https.onRequest(app);
