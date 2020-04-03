export default ({
  crypto,
  constants: { KEY_SIZE },
  rest,
  gps2box,
  stringifyBigInt
}) => {
  // Create crypto context holder
  let paillier = null

  const check = async (lat, lng) => {
    if (!paillier) {
      // Creat the crypto context
      paillier = await crypto.paillier({ keySize: KEY_SIZE })
      console.log('paillier *********', paillier)
    }
    let { sectorKey, gridTensor } = gps2box(lat, lng)

    gridTensor = gridTensor.flat()
    for (let i = 0; i < gridTensor.length; i++) {
      console.log('Encrypting tensor number:', i)
      gridTensor[i] = paillier.encrypt(gridTensor[i])
    }

    const payload = stringifyBigInt({
      sectorKey,
      gridTensor,
      publicKey: {
        n: paillier.publicKey.n,
        g: paillier.publicKey.g
      }
    })
    console.log('payload', payload)

    try {
      const response = await rest.backend.gridTensorCompute(payload)

      const {
        data: { result }
      } = response

      const answer = paillier.decrypt(result)
      return answer > 0
    } catch (err) {
      console.log('Error in request', err)
    }
  }

  return {
    check
  }
}
