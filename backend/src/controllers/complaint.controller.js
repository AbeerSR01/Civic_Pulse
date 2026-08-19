/**
 * complaint.controller.js
 * 
 * Main Complaint Controller for Express + PostgreSQL.
 * Handles CRUD operations, filtering, upvoting, status updates, and resolutions.
 */

import Complaint from "../models/Complaint.js";
import User from "../models/User.js";
import { query } from "../config/db.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import {
  routeDepartmentHook,
  calculatePriorityScoreHook,
  calculateSlaDeadlineHook,
  onComplaintCreatedHook,
  onComplaintStatusChangedHook,
  onComplaintUpvotedHook,
} from "../services/hooks/businessLogicHooks.js";

/**
 * @route   POST /api/complaints
 * @desc    Submit a new civic complaint
 * @access  Public / Optional Auth
 */
export async function createComplaintHandler(req, res, next) {
  try {
    const {
      title,
      category,
      description,
      location,
      address,
      lat,
      lng,
      photoUrl,
      citizenName,
    } = req.body;

    // Validate required fields
    if (!category) throw new ApiError(400, "Category is required (pothole, garbage, streetlight, water, other)");
    if (!description || description.trim().length < 5) {
      throw new ApiError(400, "Description must be at least 5 characters long");
    }

    // Format location
    const finalAddress = address || (typeof location === "string" ? location : location?.address);
    const finalLat = lat !== undefined && lat !== null ? Number(lat) : (location?.lat || 23.3441);
    const finalLng = lng !== undefined && lng !== null ? Number(lng) : (location?.lng || 85.3096);

    if (!finalAddress) {
      throw new ApiError(400, "Location address is required");
    }

    // Fallback title generation
    const categoryTitleMap = {
      pothole: "Pothole / Road Damage Reported",
      garbage: "Garbage Overflow / Waste Clearance",
      streetlight: "Faulty Streetlight Hazard",
      water: "Water Pipeline Leakage",
      other: "Civic Issue Reported",
    };
    const finalTitle = title || `${categoryTitleMap[category] || "Civic Complaint"} at ${finalAddress.substring(0, 30)}`;

    // Auto-route department
    const assignedDepartment = await routeDepartmentHook({
      category,
      title: finalTitle,
      description,
      location: { address: finalAddress, lat: finalLat, lng: finalLng },
    });

    // Calculate target SLA deadline
    const slaDeadline = await calculateSlaDeadlineHook({ category, department: assignedDepartment });

    // Determine reporting user
    const reportedBy = req.user ? req.user.id : null;
    const finalCitizenName = citizenName || req.user?.name || "Anonymous Citizen";

    // Initial baseline priority score
    const initialPriority = await calculatePriorityScoreHook({
      upvotes: [],
      upvoteCount: 0,
      createdAt: new Date(),
    });

    // Create complaint in PostgreSQL
    const complaint = await Complaint.create({
      title: finalTitle,
      category,
      description: description.trim(),
      photoUrl: req.body.photoUrl || photoUrl || null,
      address: finalAddress,
      lat: finalLat,
      lng: finalLng,
      status: "Reported",
      department: assignedDepartment,
      reportedBy,
      citizenName: finalCitizenName,
      priorityScore: initialPriority,
      slaDeadline,
    });

    // Trigger notification hook
    await onComplaintCreatedHook(complaint, req.user);

    return res.status(201).json(
      new ApiResponse(201, complaint, "Complaint submitted and auto-routed successfully")
    );
  } catch (error) {
    next(error);
  }
}

/**
 * @route   GET /api/complaints
 * @desc    Get complaints list with query filters (status, category, department, search, pagination, sorting)
 * @access  Public
 */
export async function getComplaintsHandler(req, res, next) {
  try {
    const {
      status,
      category,
      department,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      limit = 50,
    } = req.query;

    const pageNumber = Math.max(1, parseInt(page, 10));
    const limitNumber = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const offset = (pageNumber - 1) * limitNumber;

    const [complaints, totalCount] = await Promise.all([
      Complaint.findWithFilters({
        status,
        category,
        department,
        search,
        sortBy,
        sortOrder,
        limit: limitNumber,
        offset,
      }),
      Complaint.countWithFilters({ status, category, department, search }),
    ]);

    return res.status(200).json(
      new ApiResponse(
        200,
        complaints,
        "Complaints retrieved successfully",
        {
          total: totalCount,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(totalCount / limitNumber) || 1,
        }
      )
    );
  } catch (error) {
    next(error);
  }
}

/**
 * @route   GET /api/complaints/:id
 * @desc    Get single complaint by integer ID or ticket ID (e.g. "COMP-101")
 * @access  Public
 */
export async function getComplaintByIdHandler(req, res, next) {
  try {
    const { id } = req.params;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      throw new ApiError(404, `Complaint with ID or Ticket '${id}' not found`);
    }

    return res.status(200).json(
      new ApiResponse(200, complaint, "Complaint details retrieved successfully")
    );
  } catch (error) {
    next(error);
  }
}

/**
 * @route   PATCH /api/complaints/:id/status
 * @desc    Update complaint status
 * @access  Private / Authenticated
 */
export async function updateComplaintStatusHandler(req, res, next) {
  try {
    const { id } = req.params;
    const { status, remarks, officerName, resolutionProofUrl, resolutionPhotoUrl, isResolved } = req.body;

    const allowedStatuses = ["Reported", "Pending", "Assigned", "In Progress", "Pending Verification", "Resolved"];
    
    // Support boolean isResolved if sent from citizen verification
    let targetStatus = status;
    if (!targetStatus && isResolved !== undefined) {
      targetStatus = isResolved ? "Resolved" : "Pending";
    }

    if (!targetStatus || !allowedStatuses.includes(targetStatus)) {
      throw new ApiError(400, `Invalid status. Allowed values: [${allowedStatuses.join(", ")}]`);
    }

    const existing = await Complaint.findById(id);
    if (!existing) {
      throw new ApiError(404, `Complaint with ID '${id}' not found`);
    }

    const previousStatus = existing.status;
    const finalResolutionUrl = resolutionProofUrl || resolutionPhotoUrl || req.body.photoUrl || existing.resolutionProofUrl || existing.resolutionPhotoUrl;

    if (targetStatus === "Resolved" && !finalResolutionUrl && !existing.resolutionProofUrl) {
      throw new ApiError(400, "Resolution proof photo is required when marking a complaint as Resolved.");
    }

    const updatedComplaint = await Complaint.updateStatus(existing._id || existing.dbId || existing.id, {
      status: targetStatus,
      remarks,
      officerName: officerName || req.user?.name || "Department Officer",
      changedBy: req.user ? req.user.id : null,
      resolutionProofUrl: finalResolutionUrl,
    });

    // If citizen reopens the complaint, increment reopen_count
    if (previousStatus === "Pending Verification" && targetStatus === "Pending") {
      await query(
        "UPDATE complaints SET reopen_count = COALESCE(reopen_count, 0) + 1, updated_at = CURRENT_TIMESTAMP WHERE id = $1",
        [existing._id || existing.dbId || existing.id]
      );
    }

    const refreshed = await Complaint.findById(existing._id || existing.dbId || existing.id);

    // Trigger Status Changed Hook
    await onComplaintStatusChangedHook(refreshed, previousStatus, targetStatus, req.user);

    return res.status(200).json(
      new ApiResponse(200, refreshed, `Complaint status updated to '${targetStatus}' successfully`)
    );
  } catch (error) {
    next(error);
  }
}

/**
 * @route   POST /api/complaints/:id/upvote
 * @desc    Upvote a complaint (prevents duplicate upvotes per user via UNIQUE constraint)
 * @access  Public / Authenticated
 */
export async function upvoteComplaintHandler(req, res, next) {
  try {
    const { id } = req.params;

    const existing = await Complaint.findById(id);
    if (!existing) {
      throw new ApiError(404, `Complaint with ID '${id}' not found`);
    }

    // Resolve user ID from JWT auth token, body, or citizenName header
    let userId = req.user ? req.user.id : (req.body.userId ? Number(req.body.userId) : null);

    if (!userId) {
      const citizenName = (req.body.citizenName || req.headers["x-citizen-name"] || req.body.userName || "Rahul Sharma").trim();
      const citizenSlug = citizenName.toLowerCase().replace(/[^a-z0-9]/g, "");
      const citizenEmail = req.body.email || `${citizenSlug || "citizen"}@civicpulse.org`;

      let user = await User.findByEmail(citizenEmail);
      if (!user) {
        user = await User.create({
          name: citizenName,
          email: citizenEmail,
          passwordHash: "$2a$10$demoHashForCitizenAutoCreation1234567890",
          role: "citizen",
        });
      }
      userId = user.id;
    }

    const result = await Complaint.addUpvote(existing._id || existing.dbId || existing.id, userId);

    if (result.alreadyUpvoted) {
      throw new ApiError(409, "You have already upvoted this complaint.");
    }

    // Trigger upvote hook to recalculate priority score
    await onComplaintUpvotedHook(result.complaint, req.user || { id: userId });

    const refreshed = await Complaint.findById(existing._id || existing.dbId || existing.id);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          id: refreshed.id,
          ticketId: refreshed.ticketId,
          upvoteCount: refreshed.upvoteCount,
          upvotes: refreshed.upvotes,
          priorityScore: refreshed.priorityScore,
          upvoteUserIds: refreshed.upvoteUserIds,
        },
        "Complaint upvoted successfully"
      )
    );
  } catch (error) {
    next(error);
  }
}

/**
 * @route   POST /api/complaints/:id/resolve
 * @desc    Mark a complaint as Resolved with mandatory proof photo
 * @access  Private (Department Staff / Admin)
 */
export async function resolveComplaintHandler(req, res, next) {
  try {
    const { id } = req.params;
    const { remarks, officerName } = req.body;
    const resolutionProofUrl = req.body.resolutionProofUrl || req.body.photoUrl;

    if (!resolutionProofUrl) {
      throw new ApiError(400, "A resolution proof photo is required to mark a complaint as Resolved.");
    }

    const existing = await Complaint.findById(id);
    if (!existing) {
      throw new ApiError(404, `Complaint with ID '${id}' not found`);
    }

    const previousStatus = existing.status;

    const resolvedComplaint = await Complaint.updateStatus(id, {
      status: "Resolved",
      remarks: remarks || "Issue resolved with attached proof of work.",
      officerName: officerName || req.user?.name || "Resolving Officer",
      changedBy: req.user ? req.user.id : null,
      resolutionProofUrl,
    });

    // Trigger hook
    await onComplaintStatusChangedHook(resolvedComplaint, previousStatus, "Resolved", req.user);

    return res.status(200).json(
      new ApiResponse(200, resolvedComplaint, "Complaint marked as Resolved with proof photo")
    );
  } catch (error) {
    next(error);
  }
}
