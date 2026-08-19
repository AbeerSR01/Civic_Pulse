/**
 * complaint.routes.js
 * 
 * Complaint Endpoints Router.
 */

import express from "express";
import {
  createComplaintHandler,
  getComplaintsHandler,
  getComplaintByIdHandler,
  updateComplaintStatusHandler,
  upvoteComplaintHandler,
  resolveComplaintHandler,
} from "../controllers/complaint.controller.js";
import { verifyToken, optionalAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";
import {
  upload,
  processComplaintPhoto,
  processResolutionProof,
} from "../middleware/upload.js";

const router = express.Router();

// POST /api/complaints - Create a new complaint (supports multipart photo upload or JSON)
router.post(
  "/",
  optionalAuth,
  upload.single("photo"),
  processComplaintPhoto,
  createComplaintHandler
);

// GET /api/complaints - List complaints with query filters (status, category, department, search, pagination)
router.get("/", getComplaintsHandler);

// GET /api/complaints/:id - Get a single complaint by MongoDB ObjectId or Ticket ID ("COMP-101")
router.get("/:id", getComplaintByIdHandler);

// PATCH /api/complaints/:id/status - Update complaint status (Admin or Department Staff)
router.patch(
  "/:id/status",
  verifyToken,
  requireRole("admin", "department"),
  updateComplaintStatusHandler
);

// POST /api/complaints/:id/upvote - Upvote a complaint (prevents duplicate upvotes)
router.post("/:id/upvote", optionalAuth, upvoteComplaintHandler);

// POST /api/complaints/:id/resolve - Resolve complaint with mandatory proof photo upload
router.post(
  "/:id/resolve",
  verifyToken,
  requireRole("admin", "department"),
  upload.single("resolutionProof"),
  processResolutionProof,
  resolveComplaintHandler
);

export default router;
