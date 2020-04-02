export default ({ crypto, rest, gps2box, stringifyBigInt }) => {
  const check = async (lat, lng) => {
    let { sectorKey, gridTensor } = gps2box(lat, lng)

    gridTensor = gridTensor.flat()
    // for (let i = 0; i < gridTensor.length; i++) {
    //   console.log('Encrypting tensor number:', i)
    //   gridTensor[i] = crypto.paillier.encrypt(gridTensor[i])
    // }

    const payload = stringifyBigInt({
      sectorKey,
      gridTensor,
      publicKey: {
        n: crypto.paillier.publicKey.n,
        g: crypto.paillier.publicKey.g
      }
    })
    console.log('payload', payload)

    try {
      const response = await rest.backend.gridTensorCompute(payload)

      const {
        data: { result }
      } = response

      const answer = crypto.paillier.decrypt(result)
      return answer > 0
    } catch (err) {
      console.log('Error in request', err)
    }
  }

  return {
    check
  }
}
