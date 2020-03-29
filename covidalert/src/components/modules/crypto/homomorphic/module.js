export default ({fs}) => {
  /**
   * Creates a cryptographic provider of a specified implementation.
   *
   * @param {Object} options Options for implementation
   * @return {Object} Crypto provider
   */
  const createProvider = options => {
    const publicKeyName = `${options.prefix}_${options.publicKeyName}`;
    const secretKeyName = `${options.prefix}_${options.secretKeyName}`;
    const relinKeyName = `${options.prefix}_${options.relinKeyName}`;
    const galoisKeyName = `${options.prefix}_${options.galoisKeyName}`;

    const read = async name => fs.getData(name);
    const exists = async name => Boolean(await fs.getData(name));
    const save = async (name, key) => fs.setData(name, key);
    const destroy = async (name, key) => fs.delData(name, key);

    return {
      ...options,
      publicKeyName,
      secretKeyName,
      relinKeyName,
      galoisKeyName,
      fs: {
        read,
        exists,
        save,
        destroy,
      },
    };
  };

  return {
    createProvider,
  };
};
