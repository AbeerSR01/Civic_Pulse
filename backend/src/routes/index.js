/**
 * routes/index.js
 * 
 * Main API Route Aggregator for Express + PostgreSQL.
 * Mounts all resource routers under /api prefix.
 */

import express from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import complaintRoutes from "./complaint.routes.js";
import departmentRoutes from "./department.routes.js";
import { query, isPgConnected } from "../config/db.js";
import { ApiResponse } from "../utils/apiResponse.js";

const router = express.Router();

// GET /api - API Directory & Interactive Endpoint Map
router.get("/", (req, res) => {
  res.status(200).json(
    new ApiResponse(
      200,
      {
        service: "Civic Pulse REST API (SIH25031)",
        version: "1.0.0",
        databaseStatus: isPgConnected ? "connected (PostgreSQL)" : "active (Built-in Dev Storage)",
        endpoints: {
          health: "GET /api/health",
          auth: {
            register: "POST /api/auth/register",
            login: "POST /api/auth/login",
            verify: "POST /api/auth/verify",
            me: "GET /api/auth/me",
          },
          complaints: {
            list: "GET /api/complaints",
            create: "POST /api/complaints",
            getById: "GET /api/complaints/:id",
            updateStatus: "PATCH /api/complaints/:id/status",
            upvote: "POST /api/complaints/:id/upvote",
            resolve: "POST /api/complaints/:id/resolve",
          },
          departments: {
            listWithWorkload: "GET /api/departments",
          },
          users: {
            myProfile: "GET /api/users/me",
            userComplaints: "GET /api/users/:id/complaints",
          },
        },
      },
      "Civic Pulse API is online"
    )
  );
});

// GET /api/health - System & Database Health Check
router.get("/health", async (req, res) => {
  let dbStatus = isPgConnected ? "connected (PostgreSQL)" : "active (Built-in Dev Storage)";

  res.status(200).json(
    new ApiResponse(
      200,
      {
        status: "healthy",
        database: dbStatus,
        service: "Civic Pulse API",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
      },
      "Civic Pulse Backend API is operational"
    )
  );
});

// Mount Resource Routers
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/complaints", complaintRoutes);
router.use("/departments", departmentRoutes);

export default router;
