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
        sectorKey,
        gridTensor,
        publicKey: {n: publicKey.n, g: publicKey.g},
      }),
      {
        headers: {
          'Content-Type': 'text/plain',
        },
      },
    )
    // eslint-disable-next-line prettier/prettier
    .then(
      r => r.data.result,
      err => err,
    )
    .catch(e => console.log(e));

  return privateKey.decrypt(computation).gt(0);
};
