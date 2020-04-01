export default ({ crypto, rest, gps2box, stringifyBigInt }) => {
  const check = async (lat, lng) => {
    let { sectorKey, gridTensor } = gps2box(lat, lng)

    gridTensor = gridTensor.flat()

    console.log('gridTensor', gridTensor)
    for (let i = 0; i < gridTensor.length; i++) {
      gridTensor[i] = crypto.paillier.encrypt(gridTensor[i])
    }
    console.log('gridTensor encrypted', gridTensor)

    const computation = await rest.backend
      .gridTensorCompute(
        stringifyBigInt({
          sectorKey,
          gridTensor,
          publicKey: {
            n: crypto.paillier.publicKey.n,
            g: crypto.paillier.publicKey.g
          }
        })
      )
      .then(
        r => r.data.result,
        err => err
      )
      .catch(e => console.log(e))

    return crypto.paillier.decrypt(computation).gt(0)
  }

  return {
    check
  }
}
