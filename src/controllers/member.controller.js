// src/controllers/member.controller.js
import Member from "../models/Member.js";
import crypto from "crypto";
import { sendEmail } from "../utils/email.js";

// Generate temporary password
const generateTempPassword = () => crypto.randomBytes(4).toString("hex"); // 8 chars

// Admin adds paper member
export const createPaperMember = async (req, res) => {
  try {
    const data = req.body;

    // Check if member already exists by idNumber
    const existing = await Member.findOne({ idNumber: data.idNumber });
    if (existing) return res.status(400).json({ message: "Member already exists" });

    // If username/email provided, generate password
    let tempPassword = null;
    if (data.username && data.email) {
      tempPassword = generateTempPassword();
      data.password = tempPassword;
    }

    const member = new Member(data);
    await member.save();

    // Send email with temp password if exists
    if (tempPassword) {
      await sendEmail(data.email, "Your Account Created", `
        Your temporary password is: ${tempPassword}  
        Please login and reset your password.
      `);
    }

    res.status(201).json({ message: "Paper member created", member });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create paper member" });
  }
};

// New member self-registration
export const signupNewMember = async (req, res) => {
  try {
    const data = req.body;

    const existing = await Member.findOne({ idNumber: data.idNumber });
    if (existing) return res.status(400).json({ message: "Member already exists" });

    // Must include username, email, password
    if (!data.username || !data.email || !data.password) {
      return res.status(400).json({ message: "Username, email and password are required" });
    }

    const member = new Member({ ...data, role: "member" });
    await member.save();

    res.status(201).json({ message: "Signup successful", member });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Signup failed" });
  }
};
