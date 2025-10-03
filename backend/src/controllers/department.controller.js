import { Department } from '../models/department.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Admin can create a new department
export const createDepartment = asyncHandler(async (req, res) => {
    const { name, description, contactInfo, userId } = req.body;
    
    // Check if department name is provided
    if (!name || !userId) {
        throw new ApiError(400, 'Department name and admin user ID are required.');
    }

    // Check if a department with the same name already exists
    const existingDepartment = await Department.findOne({ name });
    if (existingDepartment) {
        throw new ApiError(409, 'Department with this name already exists.');
    }

    // Create the new department
    const newDepartment = await Department.create({
        name,
        description,
        contactInfo,
        userId
    });

    if (!newDepartment) {
        throw new ApiError(500, 'Failed to create new department.');
    }

    return res.status(201).json(
        new ApiResponse(201, newDepartment, 'Department created successfully.')
    );
});

// Everyone can get the list of all departments
export const getAllDepartments = asyncHandler(async (req, res) => {
    const departments = await Department.find();
    
    if (!departments || departments.length === 0) {
        throw new ApiError(404, 'No departments found.');
    }

    return res.status(200).json(
        new ApiResponse(200, departments, 'Departments fetched successfully.')
    );
});