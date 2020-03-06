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
    const { publicKey, privateKey } = await paillier.generateRandomKeys(16);

    const weakGridTensor = gps2box(33.77380000000002, -84.2961);

    const loopGridTensor = (gridTensor, func) => {
      const newGridTensor = [];

      for (let i = 0; i < gridTensor.length; i++) {
        const newGridTensorRow = [];

        for (let j = 0; j < gridTensor[i].length; j++) {
          newGridTensorRow.push(func(gridTensor[i][j], i, j));
        }

        newGridTensor.push(newGridTensorRow);
      }

      return newGridTensor;
    };

    const gridTensor = loopGridTensor(weakGridTensor.gridTensor, val =>
      publicKey.encrypt(val)
    );

    console.log(gridTensor);

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

            console.log(patientGridTensor.convertedLocation.gridTensor);

            // Multiply that against the grid tensor from the user
            const eMulVal = loopGridTensor(gridTensor, (v, i, j) =>
              publicKey.multiply(gridTensor[i][j], patientGridTensor[i][j])
            );

            console.log(eMulVal);
            // const eMulVal = publicKey.multiply(gridTensor, patientGridTensor);

            // if (eOverlapGridTensor) {
            //   // If eOverlapGridTensor already has a value, add it to the new eMulVal
            //   eOverlapGridTensor = publicKey.addition(
            //     eOverlapGridTensor,
            //     eMulVal
            //   );
            // } else {
            //   // If eOverlapGridTensor isn't set yet, set it to eMulVal
            eOverlapGridTensor = eMulVal;
            // }
          });

          console.log('FINAL', privateKey.decrypt(eOverlapGridTensor));

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

const runClient = async (lat, lng) => {
  // Create a random public/private key pair for the Paillier cryptosystem
  const { publicKey, privateKey } = await paillier.generateRandomKeys(3072);

  // Convert latitude and longitude into a sectorKey and gridTensor
  const { sectorKey, gridTensor } = gps2box(lat, lng);

  // Send just the sectorKey
  console.log('SENDING THE SECTOR KEY', sectorKey);

  // TODO: CHANGE ME HERE!!!
  // We have a positive sector match!
  const HAVE_POSITIVE_SECTOR_MATCH_CHANGE_ME = true;

  if (HAVE_POSITIVE_SECTOR_MATCH_CHANGE_ME) {
    // Encrypt the gridTensor
    const encryptedGridTensor = publicKey.encrypt(gridTensor);

    console.log(
      'SENDING THE SECTOR KEY, ENCRYPTED GRID TENSOR, AND PUBLIC KEY',
      sectorKey,
      encryptedGridTensor,
      publicKey
    );

    const FAKE_GRID_TENSOR_RESPONSE_CHANGE_ME = [];

    const decryptedServerGridTensor = privateKey.decrypt(
      FAKE_GRID_TENSOR_RESPONSE_CHANGE_ME
    );

    if (decryptedServerGridTensor.some(v => v >= 1)) {
      console.log('THROW A PUSH NOTIFICATION TO GET OUT OF THE AREA');
    }
  }
};
