export default ({ paillier, base64 }) =>
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
   * @param {Object} options.constants Constants
   * @param {Number} options.constants.KEY_SIZE Key size in bits
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
    fs,
    constants: { KEY_SIZE }
  }) => {
    let publicKey = null
    let secretKey = null

    // TODO: move this into serialization class
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

    const loadKeys = async () => {
      secretKey = await fs.read(secretKeyName)
      publicKey = await fs.read(publicKeyName)
    }

    const doKeysExist = () => fs.existsMultiple(secretKeyName, publicKeyName)

    const genKeyPair = async () => {
      const keys = paillier.generateRandomKeys(KEY_SIZE)
      secretKey = keys.privateKey
      publicKey = keys.publicKey

      await fs.saveMultiple([
        [secretKeyName, JSON.stringify(secretKey)],
        [publicKeyName, JSON.stringify(publicKey)]
      ])
    }

    const clearKeys = () => fs.destroyMultiple(secretKeyName, publicKeyName)

    const Init = async () => {
      console.log('Initializing paillier keys... ')
      const exists = await doKeysExist()

      if (exists) {
        console.log('Loading paillier keys...')
        await loadKeys()
        console.log('Loading paillier keys...done!')
      } else {
        console.log('Generating paillier keys...')
        await genKeyPair()
        console.log('Generating paillier keys...done!')
      }
    }

    // Create wrapped implementations
    const Encrypt = (...args) => publicKey.encrypt.apply(publicKey, args)
    const Decrypt = (...args) => secretKey.decrypt.apply(secretKey, args)
    const Evaluate = {
      add: () => (...args) => publicKey.addition.apply(publicKey, args),
      multiply: () => (...args) => publicKey.multiply.apply(publicKey, args)
    }

    // TODO: create a serialization class which uses reflection
    const Serialize = object => {
      const string = JSON.stringify(object)
      const bytes = Uint8Array.from(string)
      return base64.fromByteArray(bytes)
    }
    const Deserialize = encoded => {
      const bytes = base64.toByteArray(encoded)
      return Utf8ArrayToStr(bytes)
    }

    return {
      // Common implementation
      init: init(Init),
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
