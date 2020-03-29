export default ({
  constants: {CLOUD_FUNCTION_URL},
  request,
  createBackendApi,
}) => {
  const defaults = {
    timeout: 60000,
    headers: {
      'Content-Type': 'text/plain',
    },
  };

  const backend = request.createRestAPIProvider({
    ...defaults,
    baseURL: CLOUD_FUNCTION_URL,
  });

  return {
    backend: createBackendApi(backend),
  };
};
