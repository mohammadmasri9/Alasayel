// An error with an HTTP status code. Throw it from any controller or
// middleware and the central error handler turns it into a JSON response.
export default class ApiError extends Error {
  constructor(status, message, details) {
    super(message)
    this.status = status
    this.details = details
  }
}
