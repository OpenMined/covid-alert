export default ({rest, gps2box, stringifyBigInt}) => {
  const check = async (publicKey, privateKey, lat, lng) => {
    let {sectorKey, gridTensor} = gps2box(lat, lng);

    gridTensor = gridTensor.flat();

    for (let i = 0; i < gridTensor.length; i++) {
      gridTensor[i] = publicKey.encrypt(gridTensor[i]);
    }

    const computation = await rest.backend
      .gridTensorCompute(
        stringifyBigInt({
          sectorKey,
          gridTensor,
          publicKey: {n: publicKey.n, g: publicKey.g},
        }),
      )
      .then(r => r.data.result, err => err)
      .catch(e => console.log(e));

    return privateKey.decrypt(computation).gt(0);
  };

  return {
    check,
  };
};
