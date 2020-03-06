const functions = require('firebase-functions');
const admin = require('firebase-admin');
const paillier = require('paillier-bigint');
const gps2box = require('gps-sector-grid');

const serviceAccount = require('./coronavirus-mapper-firebase-adminsdk-i6ree-699f4198bb.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://coronavirus-mapper.firebaseio.com'
});

const db = admin.firestore();

const loopGridTensor = (grid, func) => {
  const newGrid = [];

  for (let i = 0; i < grid.length; i++) {
    const newGridRow = [];

    for (let j = 0; j < grid[i].length; j++) {
      newGridRow.push(func(grid[i][j], i, j));
    }

    newGrid.push(newGridRow);
  }

  return newGrid;
};

exports.performSectorMatch = functions.https.onRequest((req, res) => {
  const { sectorKey } = req.body;

  db.collectionGroup('locations')
    .where('sector_key', '==', sectorKey)
    .get()
    .then(snapshot => {
      if (snapshot.size >= 1) {
        return res.send(JSON.stringify({ matches: true }));
      }

      return res.send(JSON.stringify({ matches: false }));
    })
    .catch(error => {
      console.log(`Could not perform lookup on sector ${sectorKey}`, error);

      return res.send(JSON.stringify({ matches: false }));
    });
});

exports.performGridTensorComputation = functions.https.onRequest(
  async (req, res) => {
    // const { sectorKey, gridTensor, publicKey } = req.body;

    const sectorKey = 'hello';
    const { publicKey, privateKey } = await paillier.generateRandomKeys(1024);

    const weakGridTensor = gps2box(33.77380000000002, -84.2961);

    const gridTensor = loopGridTensor(weakGridTensor.gridTensor, val =>
      publicKey.encrypt(val)
    );

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

            // Convert the patient's lat and lng to a gridTensor
            const convertedLocation = gps2box(location.lat, location.lng);
            const patientGridTensor = convertedLocation.gridTensor;

            // Multiply that against the grid tensor from the user
            let eMulVal = loopGridTensor(gridTensor, (v, i, j) =>
              publicKey.multiply(gridTensor[i][j], patientGridTensor[i][j])
            );

            if (eOverlapGridTensor) {
              // If eOverlapGridTensor already has a value, add it to the new eMulVal
              eOverlapGridTensor = loopGridTensor(gridTensor, (v, i, j) =>
                publicKey.addition(eOverlapGridTensor[i][j], eMulVal[i][j])
              );
            } else {
              // If eOverlapGridTensor isn't set yet, set it to eMulVal
              eOverlapGridTensor = eMulVal;
            }
          });

          let finalDecryptedArray = loopGridTensor(eOverlapGridTensor, val =>
            privateKey.decrypt(val)
          );

          console.log('FINAL', finalDecryptedArray);

          // Send the resulting tensor
          return res.send(JSON.stringify({ result: eOverlapGridTensor }));
        }

        return res.send(JSON.stringify({ matches: false }));
      })
      .catch(error => {
        console.log(`Could not perform lookup on sector ${sectorKey}`, error);

        return res.send(JSON.stringify({ matches: false }));
      });
  }
);
