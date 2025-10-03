import express from 'express';
import { getReportHistory } from '../controllers/reportHistory.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Route to get the history of a specific report
router.get('/:reportId/history', authMiddleware, getReportHistory);

export default router;