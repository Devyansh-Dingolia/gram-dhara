// backend/src/middlewares/error.middleware.js

import { ApiError } from '../utils/ApiError.js';

const errorMiddleware = (err, req, res, next) => {
    // Log the error for debugging purposes
    console.error(err);

    // Use the custom ApiError class for structured errors
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: err.success,
            message: err.message,
            errors: err.errors
        });
    } else {
        // Handle all other unexpected errors
        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred.",
            errors: [err.message]
        });
    }
};

export { errorMiddleware };