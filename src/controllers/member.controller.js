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
    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({ message: "Request body is missing" });
    }

    // Check duplicate idNumber
    const existing = await Member.findOne({ idNumber: data.idNumber });
    if (existing) return res.status(400).json({ message: "Member already exists" });

    // Require password if username exists
    if (data.username && !data.password) {
      return res.status(400).json({ message: "Password is required when username is provided" });
    }

    const member = new Member(data);
    await member.save();

    res.status(201).json({ message: "Paper member created", member });
  } catch (error) {
    console.error("Error creating paper member:", error);
    res.status(500).json({ message: "Failed to create paper member", error: error.message });
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
