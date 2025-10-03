import express from 'express';
import {
    getDashboardStats,
    getAllUsers,
    updateUserRole,
    deleteUser,
    updateReportStatus,
    assignReport,
    resolveReport,
    isAdmin
} from '../controllers/admin.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { uploadMiddleware } from '../middlewares/upload.middleware.js';

const router = express.Router();

// Protected routes - require authentication
router.use(authMiddleware);

// Admin dashboard stats
router.route('/dashboard-stats').get(getDashboardStats);

// User management
router.route('/users').get(getAllUsers);
router.route('/users/:userId/role').put(updateUserRole);
router.route('/users/:userId').delete(deleteUser);

// All routes below require a valid access token and an admin role
router.use(isAdmin);

// Update a report's status
router.put('/reports/:reportId/status', updateReportStatus);

// Assign a report to an official
router.post('/reports/:reportId/assign', assignReport);

// New endpoint to mark a report as solved with a photo
router.post('/reports/:reportId/resolve', uploadMiddleware.single('photo'), resolveReport);

export default router;