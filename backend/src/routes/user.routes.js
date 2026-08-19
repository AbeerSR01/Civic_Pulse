/**
 * user.routes.js
 * 
 * User Profile & User Complaints Routes.
 */

import express from "express";
import { getMeHandler, getUserComplaintsHandler } from "../controllers/user.controller.js";
import { verifyToken, optionalAuth } from "../middleware/auth.js";

const router = express.Router();

// GET /api/users/me - Retrieve current authenticated user's profile and stats
router.get("/me", verifyToken, getMeHandler);

// GET /api/users/:id/complaints - Retrieve all complaints reported by a specific user
router.get("/:id/complaints", optionalAuth, getUserComplaintsHandler);

export default router;
