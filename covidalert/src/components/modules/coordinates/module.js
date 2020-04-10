export default ({
  crypto,
  constants: {
    PAILLIER: { KEY_SIZE },
    SEAL: {
      SCHEME_TYPE,
      SECURITY_LEVEL,
      POLY_MODULUS_DEGREE,
      COEFF_MODULUS_BIT_SIZES,
      PLAIN_MODULUS_BIT_SIZE,
      EXPAND_MOD_CHAIN,
      GALOIS_STEPS,
      SYMMETRIC
    }
  },
  rest,
  gps2box,
  stringifyBigInt
}) => {
  // Create crypto context holder
  let paillier = null
  // let seal = null
  const check = async (lat, lng) => {
    if (!paillier) {
      // Creat the crypto context
      paillier = await crypto.paillier({ keySize: KEY_SIZE })
    }
    // if (!seal) {
    //   // Creat the crypto context
    //   seal = await crypto.seal({
    //     schemeType: SCHEME_TYPE,
    //     securityLevel: SECURITY_LEVEL,
    //     polyModulusDegree: POLY_MODULUS_DEGREE,
    //     coeffModulusBitSizes: COEFF_MODULUS_BIT_SIZES,
    //     plainModulusBitSize: PLAIN_MODULUS_BIT_SIZE,
    //     expandModChain: EXPAND_MOD_CHAIN,
    //     galoisSteps: GALOIS_STEPS,
    //     symmetric: SYMMETRIC
    //   })
    // }

    let { sectorKey, gridTensor } = gps2box(lat, lng)

    gridTensor = gridTensor.flat()

    // Paillier
    for (let i = 0; i < gridTensor.length; i++) {
      // console.log('Encrypting tensor number:', i)
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

    // Seal
    // const plain = seal.encode(Int32Array.from(gridTensor))
    // const cipher = seal.encrypt(plain)
    //
    // const payload = JSON.stringify({
    //   sectorKey,
    //   gridTensor: cipher.save(),
    //   galoisKeys: seal.galoisKeys
    // })

    try {
      const response = await rest.backend.gridTensorCompute(payload)

      const {
        data: { result }
      } = response

      // Paillier
      const answer = paillier.decrypt(result)
      return answer > 0

      // Seal
      // const decrypted = seal.decrypt(result)
      // const answer = seal.decode(decrypted)
      // Pick any arbitrary index (all the same)
      // return answer[0] > 0
    } catch (err) {
      console.log('Error in request', err)
    }
  }

  return {
    check
  }
}
