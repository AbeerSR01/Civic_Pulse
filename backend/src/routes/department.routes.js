/**
 * department.routes.js
 * 
 * Department Routes.
 */

import express from "express";
import { getDepartmentsHandler } from "../controllers/department.controller.js";

const router = express.Router();

// GET /api/departments - List all municipal departments with workload stats
router.get("/", getDepartmentsHandler);

export default router;
