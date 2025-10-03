// backend/src/routes/analytic.router.js

import express from 'express';
import { getDashboardSummary, generateAnalyticsController } from '../controllers/analytic.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

// A protected route for getting dashboard data
router.get('/dashboard', authMiddleware, getDashboardSummary);

// A protected route to manually trigger analytics generation
router.post('/generate', authMiddleware, generateAnalyticsController);

export default router;