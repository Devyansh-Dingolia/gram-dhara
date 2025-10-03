// backend/src/utils/analytics.service.js

import { Report } from '../models/report.model.js';
import { Analytic } from '../models/analytics.model.js';
import { asyncHandler } from './asyncHandler.js';

export const generateAnalytics = asyncHandler(async () => {
    // 1. Calculate the total report count
    const reportCount = await Report.countDocuments();

    // 2. Calculate the resolved report count
    const resolvedCount = await Report.countDocuments({ status: 'resolved' });

    // 3. Calculate average resolution time
    // This requires a more complex aggregation pipeline.
    // We'll calculate the difference between the 'resolvedAt' and 'createdAt' timestamps.
    const avgResolutionTimeResult = await Report.aggregate([
        {
            $match: {
                status: 'resolved' // Only consider resolved reports
            }
        },
        {
            $project: {
                resolutionTime: { $subtract: ["$updatedAt", "$createdAt"] }
            }
        },
        {
            $group: {
                _id: null,
                avgTime: { $avg: "$resolutionTime" }
            }
        }
    ]);

    const avgResolutionTime = avgResolutionTimeResult.length > 0
        ? avgResolutionTimeResult[0].avgTime
        : 0;

    // 4. Save the new analytics record
    const newAnalyticRecord = await Analytic.create({
        reportCount,
        resolvedCount,
        avgResolutionTime: avgResolutionTime / (1000 * 60 * 60 * 24) // Convert milliseconds to days
        // Note: The categoryId is required in the schema, but our current aggregation is for all categories. We'll add a placeholder or update the schema later.
    });

    console.log('Analytics generated:', newAnalyticRecord);
    return newAnalyticRecord;
});