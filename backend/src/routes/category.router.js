import express from 'express';
import { createCategory, getAllCategories } from '../controllers/category.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

// A protected route for creating a new category (only admin role should be able to access)
router.post('/create', authMiddleware, createCategory);

// A public route to get all categories
router.get('/all', getAllCategories);

export default router;