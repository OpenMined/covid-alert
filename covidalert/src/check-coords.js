import {gps2box, stringifyBigInt, parseBigInt} from 'gps-sector-grid';
import axios from 'axios';
import JSBI from 'jsbi';

export default async (publicKey, privateKey, lat, lng) => {
  const URL = 'https://us-central1-coronavirus-mapper.cloudfunctions.net/api';

  let {sectorKey, gridTensor} = gps2box(lat, lng);

  gridTensor = gridTensor.flat();

  for (let i = 0; i < gridTensor.length; i++) {
    gridTensor[i] = publicKey.encrypt(gridTensor[i]);
  }

  const computation = await axios
    .post(
      `${URL}/grid-tensor-computation`,
      stringifyBigInt({
        sectorKey: '38.72:-9.21',
        gridTensor,
        publicKey: {n: publicKey.n, g: publicKey.g},
      }),
      {
        headers: {
          'Content-Type': 'text/plain',
        },
      },
    )
    .then(
      r => console.log('results json', r) || r.data,
      err => console.warn('error #2', JSON.stringify(err)),
    )
    .catch(err => console.log('erro', err));
  console.log('computation', computation);
  if (computation.hasOwnProperty('matches') && !computation.matches) {
    // Sector doesn't match
    return false;
  } else {
    // Sector matches
    let parsedResult = parseBigInt(computation.result);
    console.log('before decrypt', parsedResult);
    for (let i = 0; i < parsedResult.length; i++) {
      console.log(typeof parsedResult[i], parsedResult === JSBI.BigInt(1));
      parsedResult[i] = privateKey.decrypt(parsedResult[i]);
    }
    console.log('after decrypt', parsedResult);
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
