/**
 * errorHandler.js
 * 
 * Centralized Error-Handling Middleware for Express + PostgreSQL.
 * Catches all thrown ApiErrors, PostgreSQL errors, and unexpected exceptions,
 * formatting them into a standard JSON response.
 */

import { ApiError } from "../utils/apiError.js";

export function notFoundHandler(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

export function globalErrorHandler(err, req, res, next) {
  let error = err;

  // If error is not an instance of custom ApiError, convert it
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || (error.name === "ValidationError" ? 400 : 500);
    const message = error.message || "Internal Server Error";
    error = new ApiError(statusCode, message, error.errors || null);
  }

  // Handle PostgreSQL Unique Violation (code 23505)
  if (err.code === "23505") {
    const detail = err.detail || "";
    error = new ApiError(409, `Record already exists: ${detail || "Duplicate key violation."}`);
  }

  // Handle PostgreSQL Foreign Key Violation (code 23503)
  if (err.code === "23503") {
    error = new ApiError(400, `Referenced record does not exist: ${err.detail || "Foreign key violation."}`);
  }

  // Handle PostgreSQL Not Null Violation (code 23502)
  if (err.code === "23502") {
    error = new ApiError(400, `Missing required field: '${err.column}' cannot be null.`);
  }

  // Handle PostgreSQL Invalid Data Type (code 22P02)
  if (err.code === "22P02") {
    error = new ApiError(400, `Invalid data input format: ${err.message}`);
  }

  // Handle Multer File Size Error
  if (err.code === "LIMIT_FILE_SIZE") {
    error = new ApiError(400, "File size exceeds the 5MB limit. Please upload a smaller photo.");
  }

  // Log non-404 errors for debugging
  if (error.statusCode !== 404) {
    console.error(`🚨 [Server Error] ${req.method} ${req.url} -> ${error.statusCode} ${error.message}`);
    if (process.env.NODE_ENV === "development" && err.stack) {
      console.error(err.stack);
    }
  }

  // Send standardized JSON error response
  res.status(error.statusCode || 500).json({
    success: false,
    statusCode: error.statusCode || 500,
    message: error.message,
    details: error.details || null,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
  });
}
