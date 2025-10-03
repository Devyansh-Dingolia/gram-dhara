import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const authMiddleware = asyncHandler(async (req, res, next) => {
    try {
        console.log('Auth middleware - Headers:', req.headers.authorization);
        console.log('Auth middleware - Cookies:', req.cookies);
        
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        console.log('Auth middleware - Extracted token:', token ? token.substring(0, 20) + '...' : 'none');

        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        console.log('Auth middleware - Decoded token:', decodedToken);

        // The JWT token contains userId, but we need to find user by _id
        // Let's try both userId field and _id field
        let user = null;
        
        if (decodedToken.userId) {
            // Find by userId field in the document
            user = await User.findOne({ userId: decodedToken.userId }).select("-passwordHash -refreshToken");
            console.log('Auth middleware - Found user by userId:', user ? user.email : 'none');
        } else if (decodedToken._id) {
            // Find by _id field
            user = await User.findById(decodedToken._id).select("-passwordHash -refreshToken");
            console.log('Auth middleware - Found user by _id:', user ? user.email : 'none');
        }

        if (!user) {
            console.log('Auth middleware - No user found with userId:', decodedToken.userId);
            throw new ApiError(401, "Invalid Access Token");
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error.message);
        
        // More specific error handling
        if (error.name === 'JsonWebTokenError') {
            throw new ApiError(401, "Invalid token format");
        } else if (error.name === 'TokenExpiredError') {
            throw new ApiError(401, "Token has expired");
        } else if (error instanceof ApiError) {
            throw error;
        } else {
            throw new ApiError(401, "Token verification failed");
        }
    }
});