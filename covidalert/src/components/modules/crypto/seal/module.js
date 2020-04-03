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
    fs
  }) => {
    /**
     * Initializer
     *
     * @param {Object} options Seal Options
     * @param {String} options.schemeType Scheme type
     * @param {Number} options.securityLevel Security level in bits
     * @param {Number} options.polyModulusDegree Polynomial modulus degree in bits
     * @param {Array<Number>} options.coeffModulusBitSizes Bit sizes of the coefficient modulus
     * @param {Number} [options.plainModulusBitSize] Plain modulus bit size
     * @param {Boolean} options.expandModChain Expand modulus switching chain
     *
     * @returns {Promise<SEAL>}
     * @constructor
     */
    return async options => {
      const morfix = await seal()
      const VARIABLE_TYPES = {
        CIPHER_TEXT: 'CIPHER_TEXT',
        PLAIN_TEXT: 'PLAIN_TEXT'
      }

      // Create our state
      let schemeType = null
      let securityLevel = null
      let polyModulusDegree = null
      let coeffModulusBitSizes = null
      let coeffModulus = null
      let plainModulusBitSize = null
      let plainModulus = null
      let expandModChain = null
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

      console.log(`Scheme Type: ${options.schemeType}`)
      console.log(`Security Level: ${options.securityLevel}`)
      console.log(`Poly Modulus Degree: ${options.polyModulusDegree}`)
      console.log(`Coeff Modulus Bit Sizes: ${options.coeffModulusBitSizes}`)
      console.log(`Plain Modulus Bit Size: ${options.plainModulusBitSize}`)
      console.log(`Expand Modulus Chain: ${options.expandModChain}`)

      const setParameterState = opts => {
        schemeType =
          opts.schemeType === 'BFV'
            ? morfix.SchemeType.BFV
            : opts.schemeType === 'CKKS'
            ? morfix.SchemeType.CKKS
            : morfix.SchemeType.none
        securityLevel =
          opts.securityLevel === 128
            ? morfix.SecurityLevel.tc128
            : opts.securityLevel === 192
            ? morfix.SecurityLevel.tc192
            : opts.securityLevel === 256
            ? morfix.SecurityLevel.tc256
            : morfix.SecurityLevel.none
        polyModulusDegree = opts.polyModulusDegree
        coeffModulusBitSizes = Int32Array.from(opts.coeffModulusBitSizes)
        plainModulusBitSize = opts.plainModulusBitSize
        expandModChain = opts.expandModChain
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

        // We do not save Switching Keys because these take longer
        // to read and load than just creating new ones.
        await fs.saveMultiple([
          [secretKeyName, secretKey.save(morfix.ComprModeType.deflate)],
          [publicKeyName, publicKey.save(morfix.ComprModeType.deflate)]
        ])
      }
      const genRelinKeys = () => {
        relinKeys = keyGenerator.genRelinKeys()
      }
      const genGaloisKeys = () => {
        galoisKeys = keyGenerator.genGaloisKeys()
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

      // Set up entire state
      setParameterState(options)
      createParams()
      createContext()
      if (await doKeysExist()) {
        await loadKeys()
      } else {
        await genKeyPair()
      }
      // Always generate a fresh set of switching keys
      // since saving/loading keys is much slower.
      await genRelinKeys()
      await genGaloisKeys()
      createEvaluator()
      createEncoder()
      createEncryptor()
      createDecryptor()

      return {
        // Common implementation
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
  }
