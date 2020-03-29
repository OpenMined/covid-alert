export default ({
  homomophic,
  createPaillier,
  createSeal,
  constants: {
    SCHEME_TYPE,
    SECURITY_LEVEL,
    POLY_MODULUS_DEGREE,
    COEFF_MODULUS_BIT_SIZES,
    PLAIN_MODULUS_BIT_SIZE,
    EXPAND_MOD_CHAIN,
  },
}) => {
  const defaults = {
    publicKeyName: 'public_key',
    secretKeyName: 'secret_key',
    relinKeyName: 'relin_key',
    galoisKeyName: 'galois_key',
  };

  const paillier = homomophic.createProvider({
    ...defaults,
    prefix: 'paillier',
  });

  const seal = homomophic.createProvider({
    ...defaults,
    prefix: 'seal',
    constants: {
      SCHEME_TYPE,
      SECURITY_LEVEL,
      POLY_MODULUS_DEGREE,
      COEFF_MODULUS_BIT_SIZES,
      PLAIN_MODULUS_BIT_SIZE,
      EXPAND_MOD_CHAIN,
    },
  });

  return {
    paillier: createPaillier(paillier),
    seal: createSeal(seal),
  };
};
