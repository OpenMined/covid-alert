export default ({apiLibrary, RequestError}) => {
  /**
   * Method that is invoked before request is made.
   *
   * @callback
   * @param {Object} config
   * @param {Object} config.data - request payload.
   * @param {Object} config.headers - headers that are set before request is made.
   * @return {Object} config
   */
  const requestInterceptor = config => {
    // Digitally sign requests
    // const dataString = JSON.stringify(config.data);
    // config.headers['X-Signature'] = pki.sign(dataString);
    return config;
  };

  /**
   * Method that is invoked if request succeeds.
   *
   * @async
   * @callback
   * @param {Object} response Response to modify before returning
   * @return {Object} response The modified response
   */
  const responseSuccessInterceptor = response => {
    // Verify incoming response signatures
    // if (response.headers['X-Signature']) {
    //   const dataString = JSON.stringify(response.data);
    //   const signature = response.headers['X-Signature'];
    //   const verified = pki.verifyServerResponse(dataString, signature);
    //   if (!verified) {
    //     return Promise.reject(new Error('Response signature is invalid!'));
    //   }
    // }
    return Promise.resolve(response);
  };

  /**
   * Method that is invoked if request fails.
   *
   * @async
   * @callback
   * @param {Object} error
   * @param {Object} error.response - response object
   * @param {Object} error.request - request object.
   * @return {Object} config
   */
  const responseErrorInterceptor = ({response, request}) => {
    if (response) {
      const error = response.data.error || response.data;
      const requestError = new RequestError(error);
      return Promise.reject(requestError);
    }
    if (request) {
      const requestError = new RequestError({
        message: 'The request was made, but no response was received.',
      });
      return Promise.reject(requestError);
    }
    const requestError = new RequestError();
    return Promise.reject(requestError);
  };

  /**
   * Creates API provider of a specified host.
   *
   * @param {Object} options
   * @return {Object} API provider
   */
  const createRestAPIProvider = options => {
    const apiProvider = apiLibrary.create(options);
    apiProvider.defaults.withCredentials = false;
    apiProvider.interceptors.request.use(requestInterceptor);
    apiProvider.interceptors.response.use(
      responseSuccessInterceptor,
      responseErrorInterceptor,
    );
    return apiProvider;
  };

  return {
    createRestAPIProvider,
  };
};
