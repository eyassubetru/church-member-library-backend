import Member from "../models/Member.js";
import jwt from "jsonwebtoken";
import { randomBytes } from "crypto";
import {sendEmail} from '../utils/email.js'

export const login = async (req, res) => {
  const { username, password } = req.body;

  const member = await Member.findOne({ username });
  if (!member) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const isMatch = await member.comparePassword(password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: member._id, role: member.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({
    token,
    member: {
      id: member._id,
      name: member.name,
      role: member.role
    }
  });
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const member = await Member.findOne({ email });
    if (!member) {
      return res.status(404).json({ message: "No account with this email" });
    }

    const token = randomBytes(4).toString("hex");

    member.resetPasswordToken = token;
    member.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 min
    await member.save();
    console.log(token,"ooooooooo")
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await sendEmail(
      member.email,
      "Password Reset",
      `
      You requested a password reset.

      Click the link below to reset your password:
      ${resetLink}

      This link expires in 15 minutes.
      `
    );

    res.json({ message: "Password reset email sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send reset email" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const member = await Member.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!member) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    member.password = newPassword; // auto-hashed by pre-save
    member.resetPasswordToken = undefined;
    member.resetPasswordExpires = undefined;

    await member.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Password reset failed" });
  }
};



