/**
 * auth.js
 * 
 * Express JWT Authentication Verification Middleware.
 * 
 * Verifies JWT in the "Authorization: Bearer <token>" header,
 * decodes the user ID and attaches the authenticated PostgreSQL `req.user`.
 */

import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ApiError } from "../utils/apiError.js";

const JWT_SECRET = process.env.JWT_SECRET || "civic_pulse_jwt_secret_key_sih2025_secure_token";

/**
 * Generate a JWT token for a user
 * @param {Object} user - User record from PostgreSQL
 * @returns {string} Signed JWT token
 */
export function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      department: user.department,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

/**
 * Mandatory Authentication Middleware
 * Requires a valid Bearer JWT token in Authorization header.
 */
export async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "Authorization header missing or malformed. Expected 'Bearer <token>'");
    }

    const token = authHeader.split(" ")[1];

    // Check for Dev / Mock Token Bypass mode (useful for offline hackathon testing)
    if (process.env.ALLOW_DEV_AUTH_BYPASS === "true" && token.startsWith("dev-")) {
      let devRole = "citizen";
      if (token.includes("admin")) devRole = "admin";
      if (token.includes("department")) devRole = "department";

      let devUser = await User.findByEmail(`${devRole}@civicpulse.org`);
      if (!devUser) {
        devUser = await User.create({
          name: `Demo ${devRole.charAt(0).toUpperCase() + devRole.slice(1)}`,
          email: `${devRole}@civicpulse.org`,
          passwordHash: "$2a$10$abcdefghijklmnopqrstuvwxyz0123456789", // placeholder
          role: devRole,
          department: devRole === "department" ? "Public Works" : null,
        });
      }

      req.user = devUser;
      return next();
    }

    // Verify JWT Token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      throw new ApiError(401, `Invalid or expired authentication token: ${err.message}`);
    }

    // Fetch user from PostgreSQL
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new ApiError(401, "User belonging to this token no longer exists");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    console.error("🔒 [Auth Middleware Error]:", error.message);
    return next(new ApiError(401, `Authentication failed: ${error.message}`));
  }
}

/**
 * Optional Authentication Middleware
 * If token is provided, decodes and attaches req.user. If absent, proceeds without error.
 */
export async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    req.user = null;
    return next();
  }
  return verifyToken(req, res, next);
}
