import Member from "../models/Member.js";
import jwt from "jsonwebtoken";
import crypto  from "crypto";
import { sendEmail } from '../utils/email.js'

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

    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    member.refreshToken = refreshTokenHash;
    await member.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",secure: true,        // REQUIRED on Render
  sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

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
    // 1️⃣ Get refresh token from cookie
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) return res.sendStatus(401);

    // 2️⃣ Hash the token to match DB
    const hashedToken = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    // 3️⃣ Find member
    const member = await Member.findOne({ refreshToken: hashedToken });
    if (!member) {
      // Invalid token → clear cookie
      res.clearCookie("refreshToken", {
        httpOnly: true,
  secure: true,
  sameSite: "none"
      });
      return res.sendStatus(403);
    }

    // 4️⃣ Verify token
    try {
      jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      // expired or invalid → clear cookie
      res.clearCookie("refreshToken", {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      });
      return res.sendStatus(403);
    }

    // 5️⃣ Issue new access token
    const newAccessToken = jwt.sign(
      { id: member._id, role: member.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ accessToken: newAccessToken,member: {
        id: member._id,
        name: member.name,
        role: member.role
      } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to refresh access token" });
  }
};


export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) return res.sendStatus(204);

    // hash the cookie token
    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const member = await Member.findOne({ refreshToken: refreshTokenHash });

    if (member) {
      member.refreshToken = null;
      await member.save();
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production"
    });

    res.status(200).json({ message: "Logged out successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Logout failed" });
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
  `Your password reset code is: ${code}`,
  `
  <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
    <h2 style="color: #1f2937;">Password Reset Request</h2>

    <p>Hello,</p>

    <p>
      You requested to reset your password.  
      Use the code below to continue. This code will expire in
      <strong>10 minutes</strong>.
    </p>

    <div style="
      background: #f3f4f6;
      padding: 16px;
      text-align: center;
      font-size: 22px;
      font-weight: bold;
      letter-spacing: 2px;
      border-radius: 6px;
      margin: 20px 0;
    ">
      ${code}
    </div>

    <p style="font-size: 14px; color: #6b7280;">
      If you did not request this, you can safely ignore this email.
    </p>

    <hr style="margin-top: 30px;" />
    <p style="font-size: 12px; color: #9ca3af;">
      Church Management System
    </p>
  </div>
  `
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





