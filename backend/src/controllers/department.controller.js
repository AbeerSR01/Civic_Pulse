/**
 * department.controller.js
 * 
 * Municipal Department Controller for Express + PostgreSQL.
 */

import Department from "../models/Department.js";
import { ApiResponse } from "../utils/apiResponse.js";

/**
 * @route   GET /api/departments
 * @desc    Get all municipal departments along with their active ticket counts
 * @access  Public
 */
export async function getDepartmentsHandler(req, res, next) {
  try {
    const departmentStats = await Department.getWorkloadStats();

    return res.status(200).json(
      new ApiResponse(200, departmentStats, "Departments and workload statistics retrieved successfully")
    );
  } catch (error) {
    next(error);
  }
}
