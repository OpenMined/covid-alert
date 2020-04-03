export default ({ fs }) => {
  /**
   * Creates a cryptographic provider of a specified implementation.
   *
   * @param {Object} options Options for implementation
   * @return {Object} Crypto provider
   */
  const createProvider = options => {
    const publicKeyName = `${options.prefix}_${options.publicKeyName}`
    const secretKeyName = `${options.prefix}_${options.secretKeyName}`
    const relinKeyName = `${options.prefix}_${options.relinKeyName}`
    const galoisKeyName = `${options.prefix}_${options.galoisKeyName}`

    // Filesystem
    const read = async name => fs.getData(name)
    const readMultiple = async name => fs.getMultiple(name)
    const exists = async name => Boolean(await fs.getData(name))
    const existsMultiple = async (...names) => {
      const results = await fs.getMultiple(names)
      for (let i = 0; i < results.length; i++) {
        const result = results[i]
        // const key = result[0];
        const value = result[1]
        if (value === null) {
          return false
        }
      }
      return true
    }
    const save = async (name, key) => fs.setData(name, key)
    const saveMultiple = async (name, key) => fs.setMultiple(name, key)
    const destroy = async name => fs.delData(name)
    const destroyMultiple = async (...name) => fs.delMultiple(name)

    // Each adapter must implement at least these methods.
    const init = impl => (...args) => impl.apply(null, args)
    const encode = impl => (...args) => impl.apply(null, args)
    const decode = impl => (...args) => impl.apply(null, args)
    const encrypt = impl => (...args) => impl.apply(null, args)
    const decrypt = impl => (...args) => impl.apply(null, args)
    const evaluate = impl => impl // This is an object of evaluator methods to be implemented
    const serialize = impl => (...args) => impl.apply(null, args)
    const deserialize = impl => (...args) => impl.apply(null, args)

    return {
      publicKeyName,
      secretKeyName,
      relinKeyName,
      galoisKeyName,
      fs: {
        read,
        readMultiple,
        exists,
        existsMultiple,
        save,
        saveMultiple,
        destroy,
        destroyMultiple
      },
      init,
      encode,
      decode,
      encrypt,
      decrypt,
      evaluate,
      serialize,
      deserialize
    }
  }

  return {
    createProvider
  }
}
