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
  console.log(gps2box(10.12987334, -40.12987387));
  const { sectorKey } = JSON.parse(req.body);

  db.collection('locations')
    .where('sector_key', '==', sectorKey)
    .get()
    .then(snapshot => {
      if (snapshot.length >= 1) {
        return res.send(JSON.stringify({ matches: true }));
      }

      return res.send(JSON.stringify({ matches: false }));
    })
    .catch(error => {
      console.log(`Could not perform lookup on sector ${sectorKey}`, error);
    });
});

exports.performGridTensorComputation = functions.https.onRequest((req, res) => {
  const { sectorKey, gridTensor, publicKey } = JSON.parse(req.body);

  db.collection('locations')
    .where('sector_key', '==', sectorKey)
    .get()
    .then(snapshot => {
      if (snapshot.length >= 1) {
        return res.send(JSON.stringify({ matches: true }));
      }

      return res.send(JSON.stringify({ matches: false }));
    })
    .catch(error => {
      console.log(`Could not perform lookup on sector ${sectorKey}`, error);
    });
});

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

const runServer = () => {
  // Create fake data (we'll use real data input via a dashboard in the serverless endpoint)
  const data = [];

  // When the server receives a sectorKey
  const onReceiveSectorKey = sectorKey => {
    // If we have the sectorKey in our database
    if (sectorKey in data) {
      // Ask the user to send a grid tensor
      console.log('REPLY WITH REQUEST FOR GRID TENSOR');
    }
  };

  const onReceiveGridTensor = (sectorKey, gridTensor, publicKey) => {
    // Get all patient locations in that sector
    var patientLocations = data[sectorKey];

    // An array for holding the resulting grid tensors of all multiplications on patientLocations, summed together
    let eOverlapGridTensor;

    // Multiply the grid tensor by all patient grid tensors
    // Add the results of each multiplication to eOverlapGridTensor
    for (let patient in patientLocations) {
      // Convert the patient's lat and lng to a gridTensor
      const { gridTensor } = gps2box(patient.lat, patient.lng);

      // Multiply that against the grid tensor from the user
      const eMulVal = publicKey.multiply(gridTensor, patientGridTensor);

      if (eOverlapGridTensor) {
        // If eOverlapGridTensor already has a value, add it to the new eMulVal
        eOverlapGridTensor = publicKey.addition(eOverlapGridTensor, eMulVal);
      } else {
        // If eOverlapGridTensor isn't set yet, set it to eMulVal
        eOverlapGridTensor = eMulVal;
      }
    }

    console.log('REPLY WITH OVERLAPPING GRID TENSOR', eOverlapGridTensor);
  };
};
