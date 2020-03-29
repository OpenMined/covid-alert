export default ({
  seal,
  constants: {
    SCHEME_TYPE,
    SECURITY_LEVEL,
    POLY_MODULUS_DEGREE,
    COEFF_MODULUS_BIT_SIZES,
    PLAIN_MODULUS_BIT_SIZE,
    EXPAND_MOD_CHAIN,
  },
}) => {
  const publicKeyName = 'seal_public_key';
  const secretKeyName = 'seal_secret_key';
  let schemeType = null;
  let securityLevel = null;
  let polyModulusDegree = null;
  let coeffModulusBitSizes = null;
  let plainModulusBitSize = null;
  let expandModChain = null;
  let morfix = null;
  let parms = null;
  let context = null;
  let encoder = null;
  let evaluator = null;
  let encryptor = null;
  let decryptor = null;
  let keyGenerator = null;
  let publicKey = null;
  let secretKey = null;
  let relinKey = null;
  let galoisKey = null;

  const VARIABLE_TYPES = {
    CIPHER_TEXT: 'CIPHER_TEXT',
    PLAIN_TEXT: 'PLAIN_TEXT',
  };

  const setParams = (scheme, security, poly, coeff, plain = null, expand) => {
    console.log(`Scheme Type: ${scheme}`);
    console.log(`Security Level: ${security}`);
    console.log(`Poly Modulus Degree: ${poly}`);
    console.log(`Coeff Modulus Bit Sizes: ${coeff}`);
    console.log(`Plain Modulus Bit Size: ${plain}`);
    console.log(`Expand Modulus Chain: ${expand}`);
    schemeType =
      scheme === 'BFV'
        ? morfix.SchemeType.BFV
        : scheme === 'CKKS'
        ? morfix.SchemeType.CKKS
        : morfix.SchemeType.none;
    securityLevel =
      security === 128
        ? morfix.SecurityLevel.tc128
        : security === 192
        ? morfix.SecurityLevel.tc192
        : security === 256
        ? morfix.SecurityLevel.tc256
        : morfix.SecurityLevel.none;
    polyModulusDegree = poly;
    coeffModulusBitSizes = Int32Array.from(coeff);
    expandModChain = expand;
    plainModulusBitSize = plain;
  };
  const createParams = () => {
    parms = morfix.EncryptionParameters(schemeType);
    parms.setPolyModulusDegree(polyModulusDegree);
    parms.setCoeffModulus(
      morfix.CoeffModulus.Create(polyModulusDegree, coeffModulusBitSizes),
    );

    if (schemeType === morfix.SchemeType.BFV) {
      parms.setPlainModulus(
        morfix.PlainModulus.Batching(polyModulusDegree, plainModulusBitSize),
      );
    }
  };
  const createContext = () => {
    context = morfix.Context(parms, expandModChain, securityLevel);
    if (!context.parametersSet) {
      throw new Error(
        'Context parameters not set, please check encryption parameters!',
      );
    }
  };

  const createEncoder = () => {
    encoder =
      schemeType === morfix.SchemeType.BFV
        ? morfix.BatchEncoder(context)
        : schemeType === morfix.SchemeType.CKKS
        ? morfix.CKKSEncoder(context)
        : morfix.SchemeType.none;
  };
  const createEvaluator = () => {
    evaluator = morfix.Evaluator(context);
  };
  const createEncryptor = () => {
    encryptor = morfix.Encryptor(context, publicKey);
  };
  const createDecryptor = () => {
    decryptor = morfix.Decryptor(context, secretKey);
  };

  const readKey = name => fs.getData(name);
  const keyExists = async name => Boolean(await fs.getData(name));
  const saveKey = (name, key) => fs.setData(name, key);

  const loadKeys = async () => {
    const sKey = morfix.SecretKey();
    sKey.load(context, await readKey(secretKeyName));
    secretKey = sKey;
    const pKey = morfix.PublicKey();
    pKey.load(context, await readKey(publicKeyName));
    publicKey = pKey;
  };

  const doKeysExist = async () => {
    const publicKeyExists = await keyExists(publicKeyName);
    const secretKeyExists = await keyExists(secretKeyName);
    return publicKeyExists && secretKeyExists;
  };

  const saveKeys = async () => {
    await saveKey(publicKeyName, publicKey.save(morfix.ComprModeType.deflate));
    await saveKey(secretKeyName, secretKey.save(morfix.ComprModeType.deflate));
  };
  const createKeyGenerator = () => {
    keyGenerator = morfix.KeyGenerator(context);
  };

  const genKeys = async () => {
    createKeyGenerator();
    publicKey = keyGenerator.getPublicKey();
    secretKey = keyGenerator.getSecretKey();
    await saveKeys();
  };
  const genRelinKeys = () => {
    relinKey = keyGenerator.genRelinKeys();
  };
  const genGaloisKeys = () => {
    galoisKey = keyGenerator.genGaloisKeys();
  };

  const init = async () => {
    if (!morfix) {
      morfix = await seal;
    }
    // Set up the encryption state for the app
    setParams(
      SCHEME_TYPE,
      SECURITY_LEVEL,
      POLY_MODULUS_DEGREE,
      COEFF_MODULUS_BIT_SIZES,
      PLAIN_MODULUS_BIT_SIZE,
      EXPAND_MOD_CHAIN,
    );
    createParams();
    createContext();

    // Generate or load existing keys
    if (await doKeysExist()) {
      await loadKeys();
    } else {
      await genKeys();
    }

    createEvaluator();
    createEncoder();
    createEncryptor();
    createDecryptor();
  };
  const encode = (...args) => encoder.encode.apply(null, args);
  const decode = (...args) => encoder.decode.apply(null, args);
  const encrypt = (...args) => encryptor.encrypt.apply(null, args);
  const decrypt = (...args) => decryptor.decrypt.apply(null, args);
  const evaluate = (fn, ...args) => evaluator[fn].apply(null, args);

  const serialize = sealObject => {
    const encoded = sealObject.save();
    sealObject.delete();
    return encoded;
  };

  const deserialize = type => encodedSealObject => {
    if (type === VARIABLE_TYPES.CIPHER_TEXT) {
      const cipher = morfix.CipherText({context});
      cipher.load(context, encodedSealObject);
      return cipher;
    }
    const plain = morfix.PlainText({
      coeffCount: 0,
      capacity: parms.polyModulusDegree,
    });
    plain.load(context, encodedSealObject);
    return plain;
  };

  const deserializeCipher = deserialize(VARIABLE_TYPES.CIPHER_TEXT);
  const deserializePlain = deserialize(VARIABLE_TYPES.PLAIN_TEXT);

  return {
    init,
    createKeyGenerator,
    genRelinKeys,
    genGaloisKeys,
    get parms() {
      return parms;
    },
    get context() {
      return context;
    },
    get publicKey() {
      return publicKey;
    },
    get secretKey() {
      return secretKey;
    },
    get relinKeys() {
      return relinKey;
    },
    get galoisKeys() {
      return galoisKey;
    },
    get encoder() {
      return encoder;
    },
    get encryptor() {
      return encryptor;
    },
    get decryptor() {
      return decryptor;
    },
    get evaluator() {
      return evaluator;
    },
    encode,
    decode,
    encrypt,
    decrypt,
    evaluate,
    serialize,
    deserializeCipher,
    deserializePlain,
  };
};
