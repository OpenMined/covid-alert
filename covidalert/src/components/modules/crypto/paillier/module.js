export default ({paillier}) =>
  /**
   * Creates adapter for the Paillier Crypto Provider.
   *
   * @function
   * @return {Object} Paillier Crypto interface.
   */
  () => {
    const generateRandomKeys = (...args) =>
      paillier.generateRandomKeys.apply(null, args);

    return {
      generateRandomKeys,
    };
  };
