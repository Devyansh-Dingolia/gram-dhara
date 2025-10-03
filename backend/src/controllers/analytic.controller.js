// backend/src/controllers/analytic.controller.js

import { Analytic } from '../models/analytics.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { generateAnalytics } from '../utils/analytics.service.js';

// Get dashboard summary for an admin
const getDashboardSummary = asyncHandler(async (req, res) => {
    // We assume the authMiddleware has already verified the user is an admin
    
    const dashboardData = await Analytic.find()
        .populate('categoryId', 'name')
        .sort({ generatedAt: -1 })
        .limit(1); // Get the latest analytics record

    if (!dashboardData || dashboardData.length === 0) {
        throw new ApiError(404, 'No dashboard data found. Analytics may not have been run yet.');
    }

    return res.status(200).json(
        new ApiResponse(200, dashboardData[0], 'Dashboard data fetched successfully.')
    );
});

// NEW CONTROLLER FUNCTION to manually trigger analytics generation
const generateAnalyticsController = asyncHandler(async (req, res) => {
    // You can add an isAdmin check here if not already in the route
    const analytics = await generateAnalytics();
    return res.status(200).json(
        new ApiResponse(200, analytics, 'Analytics generated and stored successfully.')
    );
});

export { 
    getDashboardSummary,
    generateAnalyticsController
};