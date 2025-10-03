import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const isSuperAdmin = asyncHandler(async (req, res, next) => {
    const { role } = req.user;
    if (role === 'super_admin') {
        next();
    } else {
        throw new ApiError(403, "Forbidden: You do not have super administrative access.");
    }
});