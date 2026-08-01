/**
 * Operational error carrying an HTTP status code.
 * Thrown anywhere in the request lifecycle and handled by the global error middleware.
 */
export class ApiError extends Error {
  /**
   * @param {number} statusCode HTTP status code
   * @param {string} message Human-readable message
   * @param {object} [options]
   * @param {Array} [options.errors] Field-level validation errors
   * @param {boolean} [options.isOperational] Whether the error is expected/handled
   */
  constructor(statusCode, message, { errors = [], isOperational = true } = {}) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(msg = "Bad request", errors = []) {
    return new ApiError(400, msg, { errors });
  }
  static unauthorized(msg = "Unauthorized") {
    return new ApiError(401, msg);
  }
  static forbidden(msg = "Forbidden") {
    return new ApiError(403, msg);
  }
  static notFound(msg = "Resource not found") {
    return new ApiError(404, msg);
  }
  static conflict(msg = "Conflict") {
    return new ApiError(409, msg);
  }
  static tooMany(msg = "Too many requests") {
    return new ApiError(429, msg);
  }
}
