/**
 * apiResponse.js
 * 
 * Standardized API response format for all successful REST endpoints.
 * Keeps response JSON structure consistent across citizen, admin, and department portals.
 * 
 * Example usage:
 *   return res.status(200).json(new ApiResponse(200, complaints, "Complaints fetched successfully"));
 */

export class ApiResponse {
  /**
   * @param {number} statusCode - HTTP status code (200, 201, etc.)
   * @param {*} data - Payload data (array, object, primitive)
   * @param {string} [message="Success"] - Short descriptive success message
   * @param {Object} [meta=null] - Optional pagination or metadata (page, limit, total)
   */
  constructor(statusCode, data, message = "Success", meta = null) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    if (meta) {
      this.meta = meta;
    }
  }
}
