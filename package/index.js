// This adjusts the precision with which someone can identify how close they are to a CV patient
const INNER_BOX_PRECISION = 3;

// This adjusts the precision that the server knows of a user's location
const OUTER_BOX_PRECISION = 2;

// The number of rows and columns in a grid
const NUM_ENTRIES = Math.pow(10, INNER_BOX_PRECISION - OUTER_BOX_PRECISION);

// Make a grid of 0's with a width and height of NUM_ENTRIES
// If an "r" and "c" value are provided, set it to 1
const makeLocationGrid = (r, c) => {
  const grid = [];

  for (let i = 0; i < NUM_ENTRIES; i++) {
    const row = [];

    for (let j = 0; j < NUM_ENTRIES; j++) {
      row.push(0);
    }

    grid.push(row);
  }

  if (r && c) {
    grid[r][c] = 1;
  }

  return grid;
};

const gps2box = (lat, lng) => {
  const splitLat = lat.toString().split('.');
  const splitLng = lng.toString().split('.');

  if (splitLat[1].length < OUTER_BOX_PRECISION + INNER_BOX_PRECISION) {
    splitLat[1] = splitLat[1].padEnd(
      OUTER_BOX_PRECISION + INNER_BOX_PRECISION,
      '0'
    );
  }

  if (splitLng[1].length < OUTER_BOX_PRECISION + INNER_BOX_PRECISION) {
    splitLng[1] = splitLng[1].padEnd(
      OUTER_BOX_PRECISION + INNER_BOX_PRECISION,
      '0'
    );
  }

  const outerBoxLat = parseFloat(
    `${splitLat[0]}.${splitLat[1].substring(0, OUTER_BOX_PRECISION)}`
  );
  const outerBoxLng = parseFloat(
    `${splitLng[0]}.${splitLng[1].substring(0, OUTER_BOX_PRECISION)}`
  );

  const sectorKey = `${outerBoxLat.toString()}:${outerBoxLng.toString()}`;

  const row = parseInt(
    splitLat[1].substring(OUTER_BOX_PRECISION, INNER_BOX_PRECISION),
    10
  );
  const col = parseInt(
    splitLng[1].substring(OUTER_BOX_PRECISION, INNER_BOX_PRECISION),
    10
  );

  const gridTensor = makeLocationGrid(row, col);

  return { sectorKey, gridTensor };
};

export default gps2box;
