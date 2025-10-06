// backend/src/controllers/notice.controller.js

import { Notice } from "../models/notice.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// --- Admin Write Controllers ---

// Admin can create a new notice
export const createNotice = asyncHandler(async (req, res) => {
  const { title, content } = req.body;
  const { userId } = req.user; // Assuming authMiddleware runs before this

  if (!title || !content) {
    throw new ApiError(400, "Title and content are required for the notice.");
  }

  const newNotice = await Notice.create({
    title,
    content,
    postedBy: userId, // Record the ID of the posting admin
  });

  if (!newNotice) {
    throw new ApiError(500, "Failed to create new notice.");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, newNotice, "Notice created successfully."));
});

// Admin can update an existing notice
export const updateNotice = asyncHandler(async (req, res) => {
  const { noticeId } = req.params;
  const { title, content, isArchived } = req.body;

  if (!title && !content && isArchived === undefined) {
    throw new ApiError(
      400,
      "At least one field (title, content, or isArchived) is required for update."
    );
  }

  const notice = await Notice.findOneAndUpdate(
    { noticeId },
    { title, content, isArchived },
    { new: true } // Return the updated document
  );

  if (!notice) {
    throw new ApiError(404, "Notice not found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, notice, "Notice updated successfully."));
});

// Admin can delete (hard delete or archive) a notice
export const deleteNotice = asyncHandler(async (req, res) => {
  const { noticeId } = req.params;

  // Use findOneAndDelete for an atomic delete operation
  const deletedNotice = await Notice.findOneAndDelete({ noticeId });

  if (!deletedNotice) {
    throw new ApiError(404, "Notice not found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Notice deleted successfully."));
});

// --- User/Public Read Controllers ---

// Get all active notices (for public view)
export const getAllActiveNotices = asyncHandler(async (req, res) => {
  const activeNotices = await Notice.find({ isArchived: false })
    .sort({ createdAt: -1 }) // Sort by newest first
    .select("-postedBy -isArchived"); // Exclude sensitive/admin-only fields

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        activeNotices,
        "Active notices fetched successfully."
      )
    );
});

// Get ALL notices (for admin dashboard, including archived)
export const getAllNoticesForAdmin = asyncHandler(async (req, res) => {
  const allNotices = await Notice.find()
    .sort({ createdAt: -1 })
    .populate("postedBy", "username email role"); // Show who posted it

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        allNotices,
        "All notices (admin view) fetched successfully."
      )
    );
});

// Get a single notice by ID
export const getNoticeById = asyncHandler(async (req, res) => {
  const { noticeId } = req.params;

  const notice = await Notice.findOne({ noticeId });

  if (!notice) {
    throw new ApiError(404, "Notice not found.");
  }

  // Admins can see archived notices, public users should only see active ones
  if (
    notice.isArchived &&
    req.user.role !== "department_admin" &&
    req.user.role !== "super_admin"
  ) {
    throw new ApiError(403, "Notice is not publicly available.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, notice, "Notice fetched successfully."));
});
