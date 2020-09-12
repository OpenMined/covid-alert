export default ({
  request,
  createBackendApi,
  constants: { CLOUD_FUNCTION_URL }
}) => {
  const defaults = {
    timeout: 60000,
    headers: {
      'Content-Type': 'text/plain'
    }
  }

  const backend = request.createRestAPIProvider({
    ...defaults,
    baseURL: CLOUD_FUNCTION_URL
  })

  return {
    backend: createBackendApi(backend)
  }
}
