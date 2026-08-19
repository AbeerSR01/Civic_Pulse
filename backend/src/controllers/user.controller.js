/**
 * user.controller.js
 * 
 * User profile and user-specific complaint controller for Express + PostgreSQL.
 */

import User from "../models/User.js";
import Complaint from "../models/Complaint.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";

/**
 * @route   GET /api/users/me
 * @desc    Get currently authenticated user's profile and quick stats
 * @access  Private (Authenticated)
 */
export async function getMeHandler(req, res, next) {
  try {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized: User not found in request context");
    }

    const userId = req.user.id;
    const stats = await User.getUserStats(userId);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          user: req.user,
          stats,
        },
        "User profile retrieved successfully"
      )
    );
  } catch (error) {
    next(error);
  }
}

/**
 * @route   GET /api/users/:id/complaints
 * @desc    Get all complaints reported by a specific user
 * @access  Public / Private
 */
export async function getUserComplaintsHandler(req, res, next) {
  try {
    const { id } = req.params;

    let user = null;
    if (id === "me" && req.user) {
      user = req.user;
    } else {
      user = await User.findById(id);
    }

    if (!user) {
      throw new ApiError(404, `User with ID '${id}' not found`);
    }

    const complaints = await Complaint.findByReportedBy(user.id);

    return res.status(200).json(
      new ApiResponse(
        200,
        complaints,
        `Retrieved ${complaints.length} complaints for user '${user.name}'`,
        { count: complaints.length }
      )
    );
  } catch (error) {
    next(error);
  }
}
