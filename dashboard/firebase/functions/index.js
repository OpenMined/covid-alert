const functions = require('firebase-functions');
const admin = require('firebase-admin');
const paillier = require('paillier-bigint');

const serviceAccount = require('./coronavirus-mapper-firebase-adminsdk-i6ree-699f4198bb.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://coronavirus-mapper.firebaseio.com'
});

const db = admin.firestore();

exports.performSectorMatch = functions.https.onRequest((req, res) => {
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

exports.helloWorld = functions.https.onRequest((request, response) => {
  const initFakeData = () => {
    // A fake location entry generator function
    const getEntry = id => ({
      patient_id: 'johndoe234',
      lat: 37.3761704 + Math.random() / 1000,
      lng: -122.0762373 + Math.random() / 1000,
      timestamp: parseInt(1583357612000 + Math.random() * 10000),
      user_id: 'uk_worker_235',
      id
    });

    // Array of patient locations
    const locationTable = [];

    // Object of sectors where patients have been
    const sectorTable = {};

    // Populate locationTable with fake locations
    for (let i = 0; i < NUM_ENTRIES; i++) {
      locationTable.push(getEntry(i));
    }

    // Convert locationTable into a valid sectorTable
    for (let i = 0; i < locationTable.length; i++) {
      // Get a location
      const { lat, lng } = locationTable[i];

      // Convert lat/lng to a box (sectorKey, row, col)
      const { sectorKey, row, col } = gps2box(
        lat,
        lng,
        INNER_BOX_PRECISION,
        OUTER_BOX_PRECISION
      );

      // Either get a sector from the sectorTable, or create one if it doesn't exist yet
      const sector =
        sectorKey in sectorTable
          ? sectorTable[sectorKey]
          : makeLocationGrid(row, col);

      // Save new sector table using the sectorKey.
      sectorTable[sectorKey] = sector;
    }

    return sectorTable;
  };

  const runClient = async (lat, lng) => {
    // Create a random public/private key pair for the Paillier cryptosystem
    const { publicKey, privateKey } = await paillier.generateRandomKeys(3072);

    // Convert latitude and longitude into inner and outeer box coordinates
    const { sectorKey, row, col } = gps2box(
      lat,
      lng,
      INNER_BOX_PRECISION,
      OUTER_BOX_PRECISION
    );

    // Send just the sectorKey
    console.log('SENDING THE SECTOR KEY', sectorKey);

    // TODO: CHANGE ME HERE!!!
    // We have a positive sector match!
    const HAVE_POSITIVE_SECTOR_MATCH_CHANGE_ME = true;

    if (HAVE_POSITIVE_SECTOR_MATCH_CHANGE_ME) {
      // Convert box to grid
      const gridTensor = makeLocationGrid(row, col);

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
    const data = initFakeData();

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
        // Convert the patient's lat and lng to a row and column
        const { row, col } = gps2box(
          patient.lat,
          patient.lng,
          INNER_BOX_PRECISION,
          OUTER_BOX_PRECISION
        );

        // Make a grid tensor for the patient's location
        const patientGridTensor = makeLocationGrid(row, col);

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

  response.send(JSON.stringify({ success: true }));
});
