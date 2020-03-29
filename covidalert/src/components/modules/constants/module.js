export default () => {
  return Object.freeze({
    CLOUD_FUNCTION_URL:
      'https://us-central1-coronavirus-mapper.cloudfunctions.net/api',
    SCHEME_TYPE: 'BFV',
    SECURITY_LEVEL: 128,
    POLY_MODULUS_DEGREE: 4096,
    COEFF_MODULUS_BIT_SIZES: [36, 36, 37],
    PLAIN_MODULUS_BIT_SIZE: 20,
    EXPAND_MOD_CHAIN: true,
  });
};
