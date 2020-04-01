export default ({ seal }) =>
  /**
   * Seal implementation.
   *
   * @param {Object} options Options for implementation
   * @param {String} options.publicKeyName Public key name
   * @param {String} options.secretKeyName Secret key name
   * @param {String} options.relinKeyName Relin key name
   * @param {String} options.galoisKeyName Galois key name
   * @param {Function} options.init Initializer impl
   * @param {Function} options.encode Encode impl
   * @param {Function} options.decode Decode impl
   * @param {Function} options.encrypt Encrypt impl
   * @param {Function} options.decrypt Decrypt impl
   * @param {Function} options.evaluate Evaluate impl
   * @param {Function} options.serialize Serialize impl
   * @param {Function} options.deserialize Deserialize impl
   * @param {Object} options.fs Filesystem API
   * @param {Object} options.constants Constants
   * @param {String} options.constants.SCHEME_TYPE Scheme Type
   * @param {Number} options.constants.SECURITY_LEVEL Security level in bits
   * @param {Number} options.constants.POLY_MODULUS_DEGREE Polynomial Modulus Degree
   * @param {Array<Number>} options.constants.COEFF_MODULUS_BIT_SIZES Coefficient Modulus Degree bit sizes
   * @param {Number} options.constants.PLAIN_MODULUS_BIT_SIZE Plain Modulus bit size
   * @param {Boolean} options.constants.EXPAND_MOD_CHAIN Expand the Modulus Switching Chain
   * @return {Object} Seal implementation
   */
  ({
    publicKeyName,
    secretKeyName,
    relinKeyName,
    galoisKeyName,
    init,
    encode,
    decode,
    encrypt,
    decrypt,
    evaluate,
    serialize,
    deserialize,
    fs,
    constants: {
      SCHEME_TYPE,
      SECURITY_LEVEL,
      POLY_MODULUS_DEGREE,
      COEFF_MODULUS_BIT_SIZES,
      PLAIN_MODULUS_BIT_SIZE,
      EXPAND_MOD_CHAIN
    }
  }) => {
    let schemeType = null
    let securityLevel = null
    let polyModulusDegree = null
    let coeffModulusBitSizes = null
    let coeffModulus = null
    let plainModulusBitSize = null
    let plainModulus = null
    let expandModChain = null
    let morfix = null
    let parms = null
    let context = null
    let encoder = null
    let evaluator = null
    let encryptor = null
    let decryptor = null
    let keyGenerator = null
    let publicKey = null
    let secretKey = null
    let relinKeys = null
    let galoisKeys = null

    const VARIABLE_TYPES = {
      CIPHER_TEXT: 'CIPHER_TEXT',
      PLAIN_TEXT: 'PLAIN_TEXT'
    }

    const setParams = (scheme, security, poly, coeff, plain = null, expand) => {
      console.log(`Scheme Type: ${scheme}`)
      console.log(`Security Level: ${security}`)
      console.log(`Poly Modulus Degree: ${poly}`)
      console.log(`Coeff Modulus Bit Sizes: ${coeff}`)
      console.log(`Plain Modulus Bit Size: ${plain}`)
      console.log(`Expand Modulus Chain: ${expand}`)
      schemeType =
        scheme === 'BFV'
          ? morfix.SchemeType.BFV
          : scheme === 'CKKS'
          ? morfix.SchemeType.CKKS
          : morfix.SchemeType.none
      securityLevel =
        security === 128
          ? morfix.SecurityLevel.tc128
          : security === 192
          ? morfix.SecurityLevel.tc192
          : security === 256
          ? morfix.SecurityLevel.tc256
          : morfix.SecurityLevel.none
      polyModulusDegree = poly
      coeffModulusBitSizes = Int32Array.from(coeff)
      expandModChain = expand
      plainModulusBitSize = plain
    }
    const createParams = () => {
      parms = morfix.EncryptionParameters(schemeType)
      parms.setPolyModulusDegree(polyModulusDegree)
      coeffModulus = morfix.CoeffModulus.Create(
        polyModulusDegree,
        coeffModulusBitSizes
      )
      parms.setCoeffModulus(coeffModulus)

      if (schemeType === morfix.SchemeType.BFV) {
        plainModulus = morfix.PlainModulus.Batching(
          polyModulusDegree,
          plainModulusBitSize
        )
        parms.setPlainModulus(plainModulus)
      }
    }
    const createContext = () => {
      context = morfix.Context(parms, expandModChain, securityLevel)
      if (!context.parametersSet) {
        throw new Error(
          'Context parameters not set, please check encryption parameters!'
        )
      }
    }

    const createEncoder = () => {
      encoder =
        schemeType === morfix.SchemeType.BFV
          ? morfix.BatchEncoder(context)
          : schemeType === morfix.SchemeType.CKKS
          ? morfix.CKKSEncoder(context)
          : morfix.SchemeType.none
    }
    const createEvaluator = () => {
      evaluator = morfix.Evaluator(context)
    }
    const createEncryptor = () => {
      encryptor = morfix.Encryptor(context, publicKey)
    }
    const createDecryptor = () => {
      decryptor = morfix.Decryptor(context, secretKey)
    }
    const createKeyGenerator = (...args) => {
      keyGenerator = morfix.KeyGenerator.apply(null, args)
    }

    const loadKeys = async () => {
      const sKey = morfix.SecretKey()
      const pKey = morfix.PublicKey()
      sKey.load(context, await fs.read(secretKeyName))
      pKey.load(context, await fs.read(publicKeyName))
      secretKey = sKey
      publicKey = pKey
      createKeyGenerator(context, secretKey, publicKey)
    }

    const doKeysExist = async () =>
      fs.existsMultiple(secretKeyName, publicKeyName)

    const clearKeys = () => {
      fs.destroyMultiple(
        secretKeyName,
        publicKeyName,
        relinKeyName,
        galoisKeyName
      )
    }

    const genKeyPair = async () => {
      createKeyGenerator(context)
      secretKey = keyGenerator.getSecretKey()
      publicKey = keyGenerator.getPublicKey()

      // We do not save Switching Keys
      console.log('Saving keys...')
      await fs.saveMultiple([
        [secretKeyName, secretKey.save(morfix.ComprModeType.deflate)],
        [publicKeyName, publicKey.save(morfix.ComprModeType.deflate)]
      ])
      console.log('Saving keys...done!')
    }
    const genRelinKeys = () => {
      console.log('creating relin keys...')
      relinKeys = keyGenerator.genRelinKeys()
      console.log('creating relin keys...done!')
    }
    const genGaloisKeys = () => {
      console.log('creating galois keys...')
      galoisKeys = keyGenerator.genGaloisKeys()
      console.log('creating galois keys...done!')
    }

    const cleanUp = () => {
      if (coeffModulus) {
        coeffModulus.delete()
        coeffModulus = null
      }
      if (plainModulus) {
        plainModulus.delete()
        plainModulus = null
      }
      if (parms) {
        parms.delete()
        parms = null
      }
      if (context) {
        context.delete()
        context = null
      }
      if (encoder) {
        encoder.delete()
        encoder = null
      }
      if (evaluator) {
        evaluator.delete()
        evaluator = null
      }
      if (encryptor) {
        encryptor.delete()
        encryptor = null
      }
      if (decryptor) {
        decryptor.delete()
        decryptor = null
      }
      if (keyGenerator) {
        keyGenerator.delete()
        keyGenerator = null
      }
      if (publicKey) {
        publicKey.delete()
        publicKey = null
      }
      if (secretKey) {
        secretKey.delete()
        secretKey = null
      }
      if (relinKeys) {
        relinKeys.delete()
        relinKeys = null
      }
      if (galoisKeys) {
        galoisKeys.delete()
        galoisKeys = null
      }
    }
    /**
     * Initializer
     * @returns {Promise<void>}
     * @constructor
     */
    const Init = async () => {
      if (!morfix) {
        morfix = await seal()
      }

      cleanUp()
      // Set up the encryption state for the seal
      setParams(
        SCHEME_TYPE,
        SECURITY_LEVEL,
        POLY_MODULUS_DEGREE,
        COEFF_MODULUS_BIT_SIZES,
        PLAIN_MODULUS_BIT_SIZE,
        EXPAND_MOD_CHAIN
      )
      createParams()
      createContext()

      // clearKeys()
      // Generate or load existing keys
      if (await doKeysExist()) {
        console.log('loading keys...')
        await loadKeys()
        console.log('loading keys...done')
      } else {
        console.log('generating new keys...')
        await genKeyPair()
        console.log('generating new keys...done')
      }

      // Always generate a fresh set of switching keys
      // since saving/loading keys is much slower.
      await genRelinKeys()
      await genGaloisKeys()

      // Create static instances
      createEvaluator()
      createEncoder()
      createEncryptor()
      createDecryptor()
    }

    // Create wrapped implementations
    const Encode = (...args) => encoder.encode.apply(null, args)
    const Decode = (...args) => encoder.decode.apply(null, args)
    const Encrypt = (...args) => encryptor.encrypt.apply(null, args)
    const Decrypt = (...args) => decryptor.decrypt.apply(null, args)
    const Evaluate = {
      negate: (...args) => evaluator.negate.apply(null, args),
      add: (...args) => evaluator.add.apply(null, args),
      addPlain: (...args) => evaluator.addPlain.apply(null, args),
      sub: (...args) => evaluator.sub.apply(null, args),
      subPlain: (...args) => evaluator.subPlain.apply(null, args),
      multiply: (...args) => evaluator.multiply.apply(null, args),
      multiplyPlain: (...args) => evaluator.multiplyPlain.apply(null, args),
      square: (...args) => evaluator.square.apply(null, args),
      exponentiate: (...args) => evaluator.exponentiate.apply(null, args),
      cipherModSwitchToNext: (...args) =>
        evaluator.cipherModSwitchToNext.apply(null, args),
      cipherModSwitchTo: (...args) =>
        evaluator.cipherModSwitchTo.apply(null, args),
      plainModSwitchToNext: (...args) =>
        evaluator.plainModSwitchToNext.apply(null, args),
      plainModSwitchTo: (...args) =>
        evaluator.plainModSwitchTo.apply(null, args),
      rescaleToNext: (...args) => evaluator.rescaleToNext.apply(null, args),
      rescaleTo: (...args) => evaluator.rescaleTo.apply(null, args),
      plainTransformToNtt: (...args) =>
        evaluator.plainTransformToNtt.apply(null, args),
      cipherTransformToNtt: (...args) =>
        evaluator.cipherTransformToNtt.apply(null, args),
      cipherTransformFromNtt: (...args) =>
        evaluator.cipherTransformFromNtt.apply(null, args),
      relinearize: (cipher, ...args) =>
        evaluator.relinearize(cipher, relinKeys, ...args),
      rotateRows: (cipher, steps, ...args) =>
        evaluator.rotateRows(cipher, steps, galoisKeys, ...args),
      rotateColumns: (cipher, ...args) =>
        evaluator.rotateColumns(cipher, galoisKeys, ...args),
      rotateVector: (cipher, steps, ...args) =>
        evaluator.rotateVector(cipher, steps, galoisKeys, ...args),
      applyGalois: (cipher, galoisElt, ...args) =>
        evaluator.applyGalois(cipher, galoisElt, galoisKeys, ...args),
      complexConjugate: (cipher, ...args) =>
        evaluator.complexConjugate(cipher, galoisKeys, ...args),
      sumElements: (cipher, ...args) =>
        evaluator.sumElements(cipher, galoisKeys, schemeType, ...args),
      dotProduct: (cipherA, cipherB, ...args) =>
        evaluator.dotProduct(
          cipherA,
          cipherB,
          relinKeys,
          galoisKeys,
          schemeType,
          ...args
        )
    }
    const Serialize = object => {
      const encoded = object.save()
      object.delete()
      return encoded
    }
    const Deserialize = type => encoded => {
      if (type === VARIABLE_TYPES.CIPHER_TEXT) {
        const cipher = morfix.CipherText({ context })
        cipher.load(context, encoded)
        return cipher
      }
      const plain = morfix.PlainText({
        coeffCount: 0,
        capacity: parms.polyModulusDegree
      })
      plain.load(context, encoded)
      return plain
    }

    return {
      // Common implementation
      init: init(Init),
      encode: encode(Encode),
      decode: decode(Decode),
      encrypt: encrypt(Encrypt),
      decrypt: decrypt(Decrypt),
      evaluate: evaluate(Evaluate),
      serialize: serialize(Serialize),
      deserialize: deserialize(Deserialize),
      get publicKey() {
        return publicKey
      },
      get secretKey() {
        return secretKey
      },
      get relinKeys() {
        return relinKeys
      },
      get galoisKeys() {
        return galoisKeys
      }
    }
  }
