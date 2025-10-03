import { ApiError } from '../utils/ApiError.js';

export const isAdmin = (req, res, next) => {
    const { role } = req.user;
    if (role === 'department_admin' || role === 'super_admin') {
        next();
    } else {
        throw new ApiError(403, "Forbidden: You do not have administrative access.");
    }
};
