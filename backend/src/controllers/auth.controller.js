/**
 * auth.controller.js
 * 
 * Authentication Controller for Express + PostgreSQL.
 * Provides user registration, login, JWT token issuance, and verification.
 */

import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { generateToken } from "../middleware/auth.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (Citizen, Department Officer, or Admin)
 * @access  Public
 */
export async function registerHandler(req, res, next) {
  try {
    const { name, email, password, role = "citizen", department = null, phoneNumber = null, avatarUrl = null } = req.body;

    if (!name || !name.trim()) {
      throw new ApiError(400, "Full name is required");
    }
    if (!email || !email.includes("@")) {
      throw new ApiError(400, "A valid email address is required");
    }
    if (!password || password.length < 6) {
      throw new ApiError(400, "Password must be at least 6 characters long");
    }

    const allowedRoles = ["citizen", "admin", "department"];
    if (!allowedRoles.includes(role)) {
      throw new ApiError(400, `Invalid role. Allowed roles: [${allowedRoles.join(", ")}]`);
    }

    if (role === "department" && !department) {
      throw new ApiError(400, "Department name is required when registering as a department officer");
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new ApiError(409, `A user with email '${email}' already exists`);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user in PostgreSQL
    const newUser = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      role,
      department,
      phoneNumber,
      avatarUrl,
    });

    // Generate JWT token
    const token = generateToken(newUser);

    return res.status(201).json(
      new ApiResponse(
        201,
        {
          user: newUser,
          token,
        },
        "User registered successfully"
      )
    );
  } catch (error) {
    next(error);
  }
}

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user with email & password, returns JWT
 * @access  Public
 */
export async function loginHandler(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(400, "Email and password are required");
    }

    // Find user in PostgreSQL
    const user = await User.findByEmail(email);
    if (!user) {
      throw new ApiError(401, "Invalid email or password");
    }

    // Compare password hash
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new ApiError(401, "Invalid email or password");
    }

    // Clean user object (remove password hash)
    const { passwordHash: _, ...safeUser } = user;

    // Generate JWT token
    const token = generateToken(safeUser);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          user: safeUser,
          token,
        },
        "Login successful"
      )
    );
  } catch (error) {
    next(error);
  }
}

/**
 * @route   GET /api/auth/me, POST /api/auth/verify
 * @desc    Verify current JWT token and return authenticated user
 * @access  Private (Requires Bearer token)
 */
export async function verifyAuthHandler(req, res, next) {
  try {
    if (!req.user) {
      throw new ApiError(401, "Authentication token verification failed");
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          user: req.user,
        },
        "User authenticated and verified successfully"
      )
    );
  } catch (error) {
    next(error);
  }
}
