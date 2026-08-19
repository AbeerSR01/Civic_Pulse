/**
 * apiError.js
 * 
 * Custom Error class for operational errors throughout the application.
 * Allows throwing errors with a specific HTTP status code, message, and optional error details.
 * 
 * Example usage:
 *   throw new ApiError(404, "Complaint not found");
 *   throw new ApiError(400, "Validation failed", [{ field: "title", message: "Title is required" }]);
 */

export class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code (e.g. 400, 401, 403, 404, 500)
   * @param {string} message - Human-readable error explanation
   * @param {Array|Object} [details=null] - Additional validation or debugging details
   */
  constructor(statusCode, message = "Something went wrong", details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.success = false;

    // Capture stack trace excluding the constructor call
    Error.captureStackTrace(this, this.constructor);
  }
}
