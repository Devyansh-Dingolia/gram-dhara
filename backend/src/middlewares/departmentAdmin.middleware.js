// backend/src/middlewares/departmentAdmin.middleware.js

import { Department } from '../models/department.model.js';
import { ReportAssignment } from '../models/reportAssignment.model.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const isDepartmentAdmin = asyncHandler(async (req, res, next) => {
    const { userId, role } = req.user;
    const { reportId } = req.params;

    // First, check if the user is a department admin
    if (role !== 'department_admin') {
        throw new ApiError(403, "Forbidden: You do not have permission to perform this action.");
    }

    // Now, check if the report is assigned to this user's department
    const department = await Department.findOne({ userId: userId });
    if (!department) {
        throw new ApiError(403, "Forbidden: Your account is not associated with a department.");
    }

    const assignment = await ReportAssignment.findOne({
        reportId: reportId,
        departmentId: department.departmentId
    });

    if (!assignment) {
        throw new ApiError(403, "Forbidden: This report is not assigned to your department.");
    }

    // If all checks pass, proceed to the next middleware
    next();
});