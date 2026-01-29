import express from "express";
import {
  login,
  forgotPassword,
  resetPassword,
  logout,
  refreshAccessToken
} from "../controllers/auth.controller.js";

const router = express.Router();


router.post("/login", login);
router.post("/refresh", refreshAccessToken);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password", resetPassword);
router.post("/logout", logout);

export default router;
