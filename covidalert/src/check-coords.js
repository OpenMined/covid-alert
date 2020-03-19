import {gps2box, stringifyBigInt, parseBigInt} from 'gps-sector-grid';

export default async (publicKey, lat, lng) => {
  const URL = 'https://us-central1-coronavirus-mapper.cloudfunctions.net/api';

  let {sectorKey, gridTensor} = gps2box(lat, lng);

  gridTensor = gridTensor.flat();

  for (let i = 0; i < gridTensor.length; i++) {
    gridTensor[i] = publicKey.encrypt(gridTensor[i]);
  }

  const computation = await fetch(`${URL}/grid-tensor-computation`, {
    method: 'POST',
    body: stringifyBigInt({
      sectorKey,
      gridTensor,
      publicKey: {n: publicKey.n, g: publicKey.g},
    }),
  }).then(r => r.json());

  if (computation.hasOwnProperty('matches') && !computation.matches) {
    console.log('sector does not match');
    return false;
  } else {
    console.log('sector matches...');
    let parsedResult = parseBigInt(computation.result);

    for (let i = 0; i < parsedResult.length; i++) {
      // parsedResult[i] = privateKey.decrypt(parsedResult[i]);
    }

    const iAmSafe = parsedResult.every(v => v < 1);

    if (iAmSafe) {
      // Grid doesn't match
      return false;
    } else {
      // Grid matches
      return true;
    }
  }
};
