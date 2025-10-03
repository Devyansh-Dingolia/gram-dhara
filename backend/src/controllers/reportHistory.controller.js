import { ReportHistory } from '../models/reportHistory.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Get the history of a specific report
export const getReportHistory = asyncHandler(async (req, res) => {
    const { reportId } = req.params;

    const history = await ReportHistory.find({ reportId: reportId })
        .populate('changedByUserId', 'username name') // Populate user info
        .sort({ changedAt: 1 }); // Sort by time, oldest first

    if (!history || history.length === 0) {
        throw new ApiError(404, 'No history found for this report.');
    }

    return res.status(200).json(
        new ApiResponse(200, history, 'Report history fetched successfully.')
    );
});