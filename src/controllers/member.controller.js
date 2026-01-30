// src/controllers/member.controller.js
import Member from "../models/Member.js";
import crypto from "crypto";
import { sendEmail } from "../utils/email.js";

// Generate temporary password
const generateTempPassword = () => crypto.randomBytes(4).toString("hex"); // 8 chars

// Admin adds paper member
export const createPaperMember = async (req, res) => {
  try {
     if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Request body is missing" });}
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
    /* if (tempPassword) {
      await sendEmail(
  data.email,
  "Your Church Account Has Been Created",
  `Your temporary password is: ${tempPassword}. Please login and reset your password.`,
  `
  <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
    <h2 style="color: #065f46;">Account Created Successfully</h2>

    <p>Hello <strong>${member.name}</strong>,</p>

    <p>
      An account has been created for you in the Church Management System.
      Please use the temporary password below to log in.
    </p>

    <div style="
      background: #ecfeff;
      padding: 16px;
      text-align: center;
      font-size: 20px;
      font-weight: bold;
      border-radius: 6px;
      margin: 20px 0;
    ">
      ${tempPassword}
    </div>

    <p>
      After logging in, please change your password immediately.
    </p>

    <p style="font-size: 14px; color: #6b7280;">
      If you have any questions, please contact the church office.
    </p>

    <hr style="margin-top: 30px;" />
    <p style="font-size: 12px; color: #9ca3af;">
      Church Management System
    </p>
  </div>
  `
);
    } */

    res.status(201).json({ message: "Paper member created", member });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create paper member" });
  }
};

export const getAllMembers = async (req, res) => {
  try {
    const members = await Member.find().sort({ createdAt: -1 });
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const searchMember = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const members = await Member.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { fatherName: { $regex: q, $options: "i" } },
        { idNumber: { $regex: q, $options: "i" } },
        { email: q },
        { phoneNumber: q }
      ]
    }).select("-password -refreshToken");

    if (!members.length) {
      return res.status(404).json({ message: "No members found" });
    }

    res.json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateMember = async (req, res) => {
  try {
    const memberId = req.params.id;

    const updatedMember = await Member.findByIdAndUpdate(
      memberId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedMember) {
      return res.status(404).json({ message: "Member not found" });
    }

    res.json(updatedMember);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteMember = async (req, res) => {
  try {
    const member = await Member.findByIdAndDelete(req.params.id);

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    res.json({ message: "Member deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getMemberById = async (req, res) => {
  try {
    const memberId = req.params.id;
    const member = await Member.findById(memberId).select("-password -refreshToken");

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    res.json(member);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};