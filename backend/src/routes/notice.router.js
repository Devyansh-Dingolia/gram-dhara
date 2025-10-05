// backend/src/routes/notice.router.js

import express from "express";
import {
  createNotice,
  updateNotice,
  deleteNotice,
  getAllActiveNotices,
  getAllNoticesForAdmin,
  getNoticeById,
} from "../controllers/notice.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js"; // Assuming you import isAdmin middleware

const router = express.Router();

// --- Public/User Routes (Read-only) ---

// Get all active notices for frontend display (No auth required if fully public)
router.get("/public/all", getAllActiveNotices);

// --- Protected Routes (Admin/Super Admin) ---

// Use authMiddleware for all routes below
router.use(authMiddleware);

// Admin-only: Get all notices (including archived/private ones)
router.get("/admin/all", isAdmin, getAllNoticesForAdmin);

// Admin-only: Create a new notice
router.post("/create", isAdmin, createNotice);

// Admin-only: Update a notice (title, content, or archive status)
router.put("/:noticeId", isAdmin, updateNotice);

// Admin-only: Delete a notice
router.delete("/:noticeId", isAdmin, deleteNotice);

// Get a specific notice by ID (can be public or protected depending on requirement)
// We'll make it protected for now, but a user can access the ID if they have a token.
router.get("/:noticeId", getNoticeById);

export default router;
