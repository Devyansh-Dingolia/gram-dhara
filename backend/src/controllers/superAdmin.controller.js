import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const updateUserRole = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { newRole } = req.body;
    const { userId: currentUserId } = req.user;

    // Prevent a super_admin from changing their own role via this endpoint
    if (userId === currentUserId) {
        throw new ApiError(400, "You cannot change your own role through this endpoint.");
    }

    const userToUpdate = await User.findOne({ userId });
    if (!userToUpdate) {
        throw new ApiError(404, "User not found.");
    }

    // Check if the new role is valid
    const validRoles = ['citizen', 'department_admin', 'super_admin'];
    if (!validRoles.includes(newRole)) {
        throw new ApiError(400, "Invalid role specified.");
    }

    userToUpdate.role = newRole;
    await userToUpdate.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(200, userToUpdate, `User role updated to ${newRole}.`)
    );
});

export { updateUserRole };