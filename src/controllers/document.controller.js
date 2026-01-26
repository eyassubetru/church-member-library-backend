import Document from "../models/Document.js";
import Member from "../models/Member.js";
import { uploadToCloudinary , deleteFromCloudinary } from "../utils/cloudinary.js"; // helper functions for cloudinary

// Upload document (member-bound)
export const uploadDocument = async (req, res) => {
  try {
    const { memberId, title, documentType, documentNumber, documentSource } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileUrl = await uploadToCloudinary(req.file.path); // upload to Cloudinary

    const document = new Document({
      memberId,
      title,
      documentType,
      documentNumber,
      documentSource,
      filePath: fileUrl,
      fileType: req.file.mimetype,
      uploadedByMemberId: memberId
    });

    await document.save();
    res.status(201).json({ message: "Document uploaded", document });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to upload document" });
  }
};

// Delete document
export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findById(id);
    if (!document) return res.status(404).json({ message: "Document not found" });

    // Optional: delete from Cloudinary
    await deleteFromCloudinary(document.filePath);

    await document.deleteOne();

    res.status(200).json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete document" });
  }
};

// List all documents for a member
export const getMemberDocuments = async (req, res) => {
  try {
    const { memberId } = req.params;

    const documents = await Document.find({ memberId }).sort({ createdAt: -1 });

    res.status(200).json({ documents });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch documents" });
  }
};
