import { Category } from '../models/category.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Admin can create a new category
export const createCategory = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    
    // Check if category name is provided
    if (!name) {
        throw new ApiError(400, 'Category name is required.');
    }

    // Check if a category with the same name already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
        throw new ApiError(409, 'Category with this name already exists.');
    }

    // Create the new category
    const newCategory = await Category.create({ name, description });

    if (!newCategory) {
        throw new ApiError(500, 'Failed to create new category.');
    }

    return res.status(201).json(
        new ApiResponse(201, newCategory, 'Category created successfully.')
    );
});

// Everyone can get the list of all categories
export const getAllCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find();
    
    if (!categories || categories.length === 0) {
        throw new ApiError(404, 'No categories found.');
    }

    return res.status(200).json(
        new ApiResponse(200, categories, 'Categories fetched successfully.')
    );
});