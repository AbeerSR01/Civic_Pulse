/**
 * roles.js
 * 
 * Role-Based Access Control (RBAC) Middleware.
 * Ensures the authenticated user has one of the required roles (citizen, admin, department).
 * 
 * Usage:
 *   router.patch("/:id/status", verifyToken, requireRole("admin", "department"), updateStatusHandler);
 */

import { ApiError } from "../utils/apiError.js";

/**
 * Restricts route access to specified roles.
 * Must be placed after `verifyToken` middleware.
 * 
 * @param  {...string} allowedRoles - e.g. "admin", "department", "citizen"
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Authentication required before checking permissions"));
    }

    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      return next(
        new ApiError(
          403,
          `Access forbidden. Role '${userRole}' is not authorized to access this resource. Required: [${allowedRoles.join(", ")}]`
        )
      );
    }

    next();
  };
}
