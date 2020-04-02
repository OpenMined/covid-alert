export default () =>
  /**
   * Creates adapter for the Backend REST API provider.
   *
   * @function
   * @param {Object} apiProvider API Provider
   * @return {Object} Backend API interface.
   */
  apiProvider => {
    /**
     * Grid tensor computation
     *
     * @returns {Promise<Object>} The data from the URL.
     */
    const gridTensorCompute = (data = {}) =>
      apiProvider.post('/grid-tensor-computation', data)

    return { gridTensorCompute }
  }
