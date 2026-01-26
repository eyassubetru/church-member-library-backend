import Member from "../models/Member.js";
import jwt from "jsonwebtoken";
import { randomBytes } from "crypto";
import {sendEmail} from '../utils/email.js'

export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ message: "Missing credentials" });
    }

    const member = await Member.findOne({
      $or: [{ username: identifier }, { email: identifier }]
    });

    if (!member) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await member.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // 1️⃣ Access Token
    const accessToken = jwt.sign(
      { id: member._id, role: member.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" } // short-lived
    );

    // 2️⃣ Refresh Token
    const refreshToken = jwt.sign(
      { id: member._id, role: member.role },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" } // long-lived
    );

    // Save refresh token in DB
    member.refreshToken = refreshToken;
    await member.save();

    res.json({
      accessToken,
      refreshToken,
      member: {
        id: member._id,
        name: member.name,
        role: member.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) return res.status(401).json({ message: "No refresh token provided" });

    const member = await Member.findOne({ refreshToken });
    if (!member) return res.status(403).json({ message: "Invalid refresh token" });

    // Verify token
    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ message: "Invalid refresh token" });

      const newAccessToken = jwt.sign(
        { id: member._id, role: member.role },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
      );

      res.json({ accessToken: newAccessToken });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to refresh access token" });
  }
};



export const forgotPassword = async (req, res) => {

  const generateResetCode = () =>
   Math.floor(100000 + Math.random() * 900000).toString();

  try {
    const { email } = req.body;

    const member = await Member.findOne({ email });
    if (!member) {
      return res.status(404).json({ message: "Email not found" });
    }

    const code = generateResetCode();

    member.resetCode = code;
    member.resetCodeExpires = Date.now() + 10 * 60 * 1000; // 10 min
    await member.save();

    await sendEmail(
      email,
      "Password Reset Code",
      `Your password reset code is: ${code}`
    );

    res.json({ message: "Reset code sent to email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send reset code" });
  }
};


export const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    const member = await Member.findOne({
      email,
      resetCode: code,
      resetCodeExpires: { $gt: Date.now() }
    });

    if (!member) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    member.password = newPassword;
    member.resetCode = undefined;
    member.resetCodeExpires = undefined;
    await member.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Password reset failed" });
  }
};
export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.sendStatus(204);

    const member = await Member.findOne({ refreshToken });
    if (member) {
      member.refreshToken = null;
      await member.save();
    }

    res.status(200).json({ message: "Logged out successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Logout failed" });
  }
};




