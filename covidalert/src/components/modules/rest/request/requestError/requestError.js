export default class RequestError extends Error {
  /**
   * Represents unified error for api requests.
   * @constructor
   * @param {Object} error
   * @param {string=} error.message - short error description
   * @param {string=} error.name - name of the error
   * @param {number=} error.statusCode - error status code
   */
  constructor(error = {}) {
    super()
    this.message = error.message || 'Unknown Request Error'
    this.name = error.name || this.constructor.name
    this.statusCode = error.statusCode || 500
  }
}
