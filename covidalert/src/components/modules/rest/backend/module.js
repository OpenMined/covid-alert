export default ({apiProvider}) =>
  /**
   * Creates adapter for the Backend REST API provider.
   *
   * @function
   * @return {Object} Backend API interface.
   */
  () => {
    /**
     * Grid tensor computation
     *
     * @returns {Promise<Object>} The data from the URL.
     */
    const gridTensorCompute = (data = {}) =>
      apiProvider.post('/grid-tensor-computation', data);

    return {gridTensorCompute};
  };
