import express from "express";
import {
    createPaperMember,
    signupNewMember
} from "../controllers/member.controller.js";

import { authenticate, isAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * Admin creates member from paper
 * (may include username + email → temp password sent)
 */
router.post(
    "/paper",
    authenticate,
    isAdmin,
    createPaperMember
);

/**
 * New member self signup
 */
router.post(
    "/signup",
    signupNewMember
);

export default router;
