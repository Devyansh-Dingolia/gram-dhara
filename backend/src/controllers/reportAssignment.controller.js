// backend/src/controllers/reportAssignment.controller.js

import { ReportAssignment } from '../models/reportAssignment.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Controller to get assignment details by report ID
export const getAssignmentByReportId = asyncHandler(async (req, res) => {
    const { reportId } = req.params;
    const assignment = await ReportAssignment.findOne({ reportId: reportId })
        .populate('reportId', 'title') // Populate report details
        .populate('departmentId', 'name') // Populate department details
        .populate('assigned_to_userId', 'name email'); // Populate assigned user details

    if (!assignment) {
        throw new ApiError(404, 'No assignment found for this report.');
    }

    return res.status(200).json(
        new ApiResponse(200, assignment, 'Assignment fetched successfully.')
    );
});

// Controller to update the status of an assignment
export const updateAssignmentStatus = asyncHandler(async (req, res) => {
    const { assignmentId } = req.params;
    const { newStatus } = req.body;
    const { userId } = req.user;

    // Optional: Add a check to ensure the user making the update is the assigned user.
    const assignment = await ReportAssignment.findOneAndUpdate(
        { assignmentId: assignmentId, assigned_to_userId: userId },
        { status: newStatus },
        { new: true }
    );

    if (!assignment) {
        throw new ApiError(404, 'Assignment not found or you are not authorized to update its status.');
    }

    // You may also want to log this status change in ReportHistory here.
    // Example: await ReportHistory.create(...)

    return res.status(200).json(
        new ApiResponse(200, assignment, `Assignment status updated to ${newStatus}.`)
    );
});