import express from "express";
import {
  uploadDocument,
  deleteDocument,
  getMemberDocuments
} from "../controllers/document.controller.js";
import { authenticate, isAdmin } from "../middlewares/auth.middleware.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ dest: "temp/" }); // temporary storage before Cloudinary

// Upload document
router.post(
  "/upload",
  authenticate,
  upload.single("file"),
  uploadDocument
);

// Delete document
router.delete("/:id", authenticate, isAdmin, deleteDocument);

// Get all documents for a member
router.get("/member/:memberId", authenticate, getMemberDocuments);

export default router;
