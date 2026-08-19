/**
 * app.js
 * 
 * Express Application Setup for Civic Pulse.
 * Configures CORS, JSON/URL parsers, logger, API routing, and centralized error handling.
 */

import express from "express";
import cors from "cors";
import morgan from "morgan";
import apiRoutes from "./routes/index.js";
import { notFoundHandler, globalErrorHandler } from "./middleware/errorHandler.js";

const app = express();

// 1. CORS Configuration (Allows frontend React Vite dev server to connect)
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in hackathon development
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// 2. Request Parsing Middlewares
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// 3. HTTP Request Logging in development
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// 4. Favicon handler to prevent 404 in logs
app.get("/favicon.ico", (req, res) => res.status(204).end());

// 5. Root Welcome Route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Civic Pulse API (SIH25031)",
    docs: "/api",
    health: "/api/health",
    version: "1.0.0",
  });
});

// 6. Mount API Routes under /api
app.use("/api", apiRoutes);

// 7. 404 Route Handler for undefined routes
app.use(notFoundHandler);

// 8. Centralized Global Error Handler
app.use(globalErrorHandler);

export default app;
