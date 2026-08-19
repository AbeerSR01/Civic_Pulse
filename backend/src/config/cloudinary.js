/**
 * cloudinary.js
 * 
 * Cloudinary configuration and image upload helper.
 * Handles photo uploads for complaint submissions and resolution proof photos.
 */

import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const isCloudinaryConfigured = () => {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET &&
    process.env.CLOUDINARY_CLOUD_NAME !== "your_cloud_name"
  );
};

/**
 * Uploads a file buffer from Multer memory storage to Cloudinary.
 * If Cloudinary is not configured (e.g. during local hackathon development),
 * it returns a graceful data URI or fallback URL so the app continues working.
 * 
 * @param {Buffer} fileBuffer - File buffer from req.file.buffer
 * @param {string} folder - Target folder in Cloudinary (e.g. 'civic_pulse/complaints' or 'civic_pulse/resolutions')
 * @param {string} originalName - Original file name
 * @returns {Promise<string>} Public secure URL of uploaded image
 */
export async function uploadToCloudinary(fileBuffer, folder = "civic_pulse/complaints", originalName = "photo") {
  // If Cloudinary credentials are provided, upload via upload_stream
  if (isCloudinaryConfigured()) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
          transformation: [{ width: 1200, crop: "limit", quality: "auto" }],
        },
        (error, result) => {
          if (error) {
            console.error("❌ [Cloudinary] Upload failed:", error.message);
            return reject(error);
          }
          resolve(result.secure_url);
        }
      );

      uploadStream.end(fileBuffer);
    });
  }

  // Graceful fallback for local development without Cloudinary credentials:
  console.warn("⚠️ [Cloudinary] Not fully configured. Using fallback base64 image data.");
  const base64Data = fileBuffer.toString("base64");
  return `data:image/jpeg;base64,${base64Data}`;
}

export default cloudinary;
