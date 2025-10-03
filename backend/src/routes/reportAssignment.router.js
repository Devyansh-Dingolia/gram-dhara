// backend/src/routes/reportAssignment.router.js

import express from 'express';
import { getAssignmentByReportId, updateAssignmentStatus } from '../controllers/reportAssignment.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All routes are protected
router.use(authMiddleware);

// Get the assignment details for a specific report
router.get('/:reportId', getAssignmentByReportId);

// Update the status of an assignment (e.g., 'in_progress', 'completed')
router.put('/:assignmentId/status', updateAssignmentStatus);

export default router;