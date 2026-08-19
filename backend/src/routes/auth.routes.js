/**
 * auth.routes.js
 * 
 * Authentication Routes for Express + PostgreSQL backend.
 */

import express from "express";
import { registerHandler, loginHandler, verifyAuthHandler } from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// POST /api/auth/register - Register a new user
router.post("/register", registerHandler);

// POST /api/auth/login - Login with email and password
router.post("/login", loginHandler);

// POST /api/auth/verify - Verify JWT token
router.post("/verify", verifyToken, verifyAuthHandler);

// GET /api/auth/me - Get current authenticated user profile
router.get("/me", verifyToken, verifyAuthHandler);

export default router;
