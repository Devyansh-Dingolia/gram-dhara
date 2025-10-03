import express from 'express';
import { getMyNotifications, markNotificationAsRead } from '../controllers/notification.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All routes are protected by authMiddleware
router.use(authMiddleware);

// Get all notifications for the logged-in user
router.get('/my-notifications', getMyNotifications);

// Mark a specific notification as read
router.put('/:notificationId/read', markNotificationAsRead);

export default router;