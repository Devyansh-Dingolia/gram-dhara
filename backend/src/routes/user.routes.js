// backend/src/routes/user.routes.js

import { Router } from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    forgotPassword,
    resetPassword
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes (no authentication required)
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password/:token").post(resetPassword);

// Protected routes (authentication required)
router.route("/logout").post(authMiddleware, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(authMiddleware, changeCurrentPassword);
router.route("/current-user").get(authMiddleware, getCurrentUser);

export default router;