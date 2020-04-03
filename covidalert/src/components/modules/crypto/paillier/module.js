export default ({ paillier, base64, BigInt }) =>
  /**
   * Paillier implementation.
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
   * @return {Object} Paillier implementation
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
    // http://www.onicos.com/staff/iz/amuse/javascript/expert/utf.txt
    /* utf.js - UTF-8 <=> UTF-16 convertion
     *
     * Copyright (C) 1999 Masanao Izumo <iz@onicos.co.jp>
     * Version: 1.0
     * LastModified: Dec 25 1999
     * This library is free.  You can redistribute it and/or modify it.
     */
    function Utf8ArrayToStr(array) {
      let out, i, len, c
      let char2, char3

      out = ''
      len = array.length
      i = 0
      while (i < len) {
        c = array[i++]
        // eslint-disable-next-line no-bitwise
        switch (c >> 4) {
          case 0:
          case 1:
          case 2:
          case 3:
          case 4:
          case 5:
          case 6:
          case 7:
            // 0xxxxxxx
            out += String.fromCharCode(c)
            break
          case 12:
          case 13:
            // 110x xxxx   10xx xxxx
            char2 = array[i++]
            // eslint-disable-next-line no-bitwise
            out += String.fromCharCode(((c & 0x1f) << 6) | (char2 & 0x3f))
            break
          case 14:
            // 1110 xxxx  10xx xxxx  10xx xxxx
            char2 = array[i++]
            char3 = array[i++]
            out += String.fromCharCode(
              // eslint-disable-next-line no-bitwise
              ((c & 0x0f) << 12) |
                // eslint-disable-next-line no-bitwise
                ((char2 & 0x3f) << 6) |
                // eslint-disable-next-line no-bitwise
                ((char3 & 0x3f) << 0)
            )
            break
        }
      }

      return out
    }
    /**
     * Initializer
     *
     * @param {Object} options Paillier Options
     * @param {String} options.keySize Key size in bits
     *
     * @returns {Promise<Paillier>}
     * @constructor
     */
    return async options => {
      let publicKey = null
      let secretKey = null

      const genKeyPair = async opts => {
        const keys = paillier.generateRandomKeys(opts.keySize)
        secretKey = keys.privateKey
        publicKey = keys.publicKey

        await fs.saveMultiple([
          [secretKeyName, JSON.stringify(secretKey)],
          [publicKeyName, JSON.stringify(publicKey)]
        ])
      }

      const loadKeys = async () => {
        const rawSecretKey = await fs.read(secretKeyName)
        const rawPublicKey = await fs.read(publicKeyName)

        const secretKeyObject = JSON.parse(rawSecretKey)
        const publicKeyObject = JSON.parse(rawPublicKey)

        publicKey = new paillier.PublicKey(
          BigInt(publicKeyObject.n),
          BigInt(publicKeyObject.g)
        )
        secretKey = new paillier.PrivateKey(
          BigInt(secretKeyObject.lambda),
          BigInt(secretKeyObject.mu),
          publicKey,
          BigInt(secretKeyObject.p),
          BigInt(secretKeyObject.q)
        )
      }

      const doKeysExist = () => fs.existsMultiple(secretKeyName, publicKeyName)

      const clearKeys = () => fs.destroyMultiple(secretKeyName, publicKeyName)

      // Create wrapped implementations
      const Encrypt = (...args) => publicKey.encrypt.apply(publicKey, args)
      const Decrypt = (...args) => secretKey.decrypt.apply(secretKey, args)
      const Evaluate = {
        add: () => (...args) => publicKey.addition.apply(publicKey, args),
        multiply: () => (...args) => publicKey.multiply.apply(publicKey, args)
      }

      const Serialize = object => {
        const string = JSON.stringify(object)
        const bytes = Uint8Array.from(string)
        return base64.fromByteArray(bytes)
      }
      const Deserialize = encoded => {
        const bytes = base64.toByteArray(encoded)
        return Utf8ArrayToStr(bytes)
      }

      if (await doKeysExist()) {
        console.log('Loading saved keys...')
        await loadKeys()
      } else {
        await genKeyPair(options)
      }

      return {
        // Common implementation
        encode: () => console.log('Unused method'),
        decode: () => console.log('Unused method'),
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
        }
      }
    }
  }
