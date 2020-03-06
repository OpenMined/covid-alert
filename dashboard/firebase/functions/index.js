const functions = require("firebase-functions");

// import paillier
const paillier = require("paillier-bigint");

function gps2box(lat, lon, inner_box_precision, outer_box_precision) {
  lat_str = lat.toString().split(".");
  lon_str = lon.toString().split(".");

  outer_box_lat = parseFloat(
    lat_str[0] + "." + lat_str[1].substring(0, outer_box_precision)
  );
  outer_box_lon = parseFloat(
    lon_str[0] + "." + lon_str[1].substring(0, outer_box_precision)
  );

  box_row = parseInt(
    lat_str[1].substring(outer_box_precision, inner_box_precision)
  );
  box_col = parseInt(
    lon_str[1].substring(outer_box_precision, inner_box_precision)
  );

  key = generateSectorKey(outer_box_lat, outer_box_lon);

  return {
    sector_key: key,
    row: box_row,
    col: box_col
  };
}

function generateSectorKey(outer_box_lat, outer_box_lon) {
  return outer_box_lat.toString() + ":" + outer_box_lon.toString();
}

function getEntry() {
  entry = {
    patient_id: "johndoe234",
    latitude: 37.3761704 + Math.random() / 1000,
    longitude: -122.0762373 + Math.random() / 1000,
    timestamp: parseInt(1583357612000 + Math.random() * 10000),
    user_id: "uk_worker_235"
  };
  return entry;
}

function makeSquareGridOfZeros(edge_size) {
  grid = [];
  var i, j;
  for (i = 0; i < edge_size; i++) {
    row = [];
    for (j = 0; j < edge_size; j++) {
      row.push(0);
    }
    grid.push(row);
  }
  return grid;
}

exports.helloWorld = functions.https.onRequest((request, response) => {
  console.log(paillier);

  // GLOBAL CONFIG (both the smartphone app and the server need to agree on this configuration)
  var inner_box_precision = 4; // this adjusts the precision with which someone can identify how close they are to a CV patient
  var outer_box_precision = 2; // this adjusts the precision that the server knows of a user's location

  var num_entries = 100;
  ////////////////////////////////////////////////////////////////////////
  //////////////// BEGIN DATA LOADING LOGIC ////////////////////////
  ////////////////////////////////////////////////////////////////////////

  // INIT TABLE OF PATIENT LOCATIONS
  var location_table = [];

  // INPUT RAW DATA TO DATABASE
  var i;
  for (i = 0; i < num_entries; i++) {
    entry = getEntry();
    entry.id = i;
    location_table.push(entry);
  }

  // INIT SECTOR TABLE
  var sector_table = {};

  // CONVERT RAW LOCATION TABLE INTO SECTOR TABLE
  for (i = 0; i < location_table.length; i++) {
    // get entry
    var location = location_table[i];

    // convert lat/lon to a Box (box key, box_row, box_col)
    var box = gps2box(
      location.latitude,
      location.longitude,
      inner_box_precision,
      outer_box_precision
    );

    // if the box already exists in sector table, fetch it
    if (box.sector_key in sector_table) {
      var sector = sector_table[box.sector_key];

      // if the box doesn't already exist in sector table, create one
    } else {
      var sector = makeSquareGridOfZeros(
        10 ** (inner_box_precision - outer_box_precision)
      );
    }

    // ensure that this sector has a "1" at the current location
    sector[box.row][box.col] = 1;

    // save new sector table using sector key.
    sector_table[box.sector_key] = sector;
  }

  ////////////////////////////////////////////////////////////////////////
  //////////////// END DATA LOADING LOGIC ////////////////////////
  ////////////////////////////////////////////////////////////////////////

  ////////////////////////////////////////////////////////////////////////
  //////////////// BEGIN CLIENT APP LOGIC ////////////////////////
  ////////////////////////////////////////////////////////////////////////

  // (asynchronous) creation of a random private, public key pair for the Paillier cryptosystem
  // const {publicKey, privateKey} = await paillier.generateRandomKeys(3072);

  // Step 1 - get current location
  var lat = parseFloat(request.query.lat);
  var lon = parseFloat(request.query.lon);

  // Step 2 - convert latitude and longitude into inner and outeer box coordinates
  var box = gps2box(lat, lon, inner_box_precision, outer_box_precision);

  // Step 3 - convert box to grid
  var sector_grid = makeSquareGridOfZeros(
    10 ** (inner_box_precision - outer_box_precision)
  );

  sector_grid[box.row][box.col] = 1;

  // Step 4 - send sector key and sector_grid to server
  var message = {};
  message.sector_key = box.sector_key;
  message.sector_grid = sector_grid;

  ////////////////////////////////////////////////////////////////////////
  //////////////// END CLIENT APP LOGIC ////////////////////////
  ////////////////////////////////////////////////////////////////////////

  ////////////////////////////////////////////////////////////////////////
  //////////////// BEGIN SERVER LOGIC ////////////////////////
  ////////////////////////////////////////////////////////////////////////

  // Step 1 - Unpack message
  var client_sector_key = message.sector_key;
  var client_sector_grid = message.sector_grid;

  var result = 0;

  // Step 2 - look to see if box is in sector table.
  if (client_sector_key in sector_table) {
    // Step 2a - if box in sector table, select it
    var patient_sector_grid = sector_table[client_sector_key];

    // Step 2b - multiply patient sector grid by client sector grid
    var grid_size = 10 ** (inner_box_precision - outer_box_precision);

    var i, j;
    for (i = 0; i < grid_size; i++) {
      for (j = 0; j < grid_size; j++) {
        result += client_sector_grid[i][j] * patient_sector_grid[i][j];
      }
    }
  }

  // Step 3: Send result back to client
  var message_to_client = result;

  ////////////////////////////////////////////////////////////////////////
  //////////////// END SERVER APP LOGIC ////////////////////////
  ////////////////////////////////////////////////////////////////////////

  ////////////////////////////////////////////////////////////////////////
  //////////////// BEGIN CLIENT LOGIC ////////////////////////
  ////////////////////////////////////////////////////////////////////////

  if (message_to_client >= 1) {
    console.log(
      "\n\nYou are within 100 meters of a coronavirus patient's recept path. Please vacate the area.\n\n"
    );
  } else {
    console.log(
      "\n\nOur records do not indicate any coronavirus patients having been near this area recently.\n\n"
    );
  }

  ////////////////////////////////////////////////////////////////////////
  //////////////// END CLIENT LOGIC ////////////////////////
  ////////////////////////////////////////////////////////////////////////

  // result = input
  var result = {
    lat: lat,
    lon: lon,
    result: result
  };
  // response.send(JSON.stringify({"request":request.query.text}))
  response.send(JSON.stringify(result));
  // response.send('ANDREW - FILL THIS IN', request);
});
