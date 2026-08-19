/**
 * upload.js
 * 
 * Multer & Cloudinary File Upload Middleware.
 * Handles photo uploads for complaint submissions and resolution proof photos.
 */

import multer from "multer";
import { uploadToCloudinary } from "../config/cloudinary.js";
import { ApiError } from "../utils/apiError.js";

// Configure Multer Memory Storage (keeps file in memory buffer for Cloudinary streaming)
const storage = multer.memoryStorage();

// File filter to accept only valid image files
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg", "image/gif"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, "Invalid file type. Only JPEG, PNG, WEBP, and GIF images are allowed."));
  }
};

// Multer upload instance with 5MB max file size limit
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 Megabytes
  },
});

/**
 * Middleware to process uploaded complaint photo and upload it to Cloudinary.
 * Attaches the resulting image URL to `req.body.photoUrl`.
 */
export async function processComplaintPhoto(req, res, next) {
  try {
    if (req.file) {
      const folder = "civic_pulse/complaints";
      const uploadedUrl = await uploadToCloudinary(req.file.buffer, folder, req.file.originalname);
      req.body.photoUrl = uploadedUrl;
    }
    next();
  } catch (error) {
    console.error("📸 [Photo Upload Middleware Error]:", error.message);
    next(new ApiError(500, `Failed to upload image: ${error.message}`));
  }
}

/**
 * Middleware to process uploaded resolution proof photo.
 * Attaches the resulting image URL to `req.body.resolutionProofUrl`.
 */
export async function processResolutionProof(req, res, next) {
  try {
    if (req.file) {
      const folder = "civic_pulse/resolutions";
      const uploadedUrl = await uploadToCloudinary(req.file.buffer, folder, req.file.originalname);
      req.body.resolutionProofUrl = uploadedUrl;
    }
    next();
  } catch (error) {
    console.error("📸 [Resolution Proof Upload Error]:", error.message);
    next(new ApiError(500, `Failed to upload resolution proof image: ${error.message}`));
  }
}
