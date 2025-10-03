import express from 'express';
import { createDepartment, getAllDepartments } from '../controllers/department.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

// A protected route for creating a new department (only admin role should be able to access)
router.post('/create', authMiddleware, createDepartment);

// A public route to get all departments
router.get('/all', getAllDepartments);

export default router;