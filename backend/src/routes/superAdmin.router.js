import express from 'express';
import { updateUserRole } from '../controllers/superAdmin.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { isSuperAdmin } from '../middlewares/superAdmin.middleware.js';

const router = express.Router();

// All routes below require a valid access token and the super_admin role
router.use(authMiddleware, isSuperAdmin);

// Route to update a user's role
router.put('/users/:userId/role', updateUserRole);

export default router;