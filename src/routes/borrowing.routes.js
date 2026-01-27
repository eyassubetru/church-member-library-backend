import express from "express";
import {
  createBorrowing,
  deleteBorrowing,
  getAllBorrowings,
  getMemberBorrowings,
  recordDownload,
  getMemberDownloadHistory,
  getAllDownloadHistory,
  getAllBorrowingsHistory,
  getMemberBorrowingsHistory,
  getAllOverdueBorrowings,
  getMemberOverdueBorrowings
} from "../controllers/borrowing.controller.js";

const router = express.Router();

// Borrowings
router.post("/", createBorrowing);
router.put("/:id/return", deleteBorrowing); // mark as returned
router.get("/all", getAllBorrowings);
router.get("/allBorrowings", getAllBorrowings);
router.get("/allBorrowingsHistory", getAllBorrowingsHistory);
router.get("/memberMemberBorrowings/:memberId", getMemberBorrowings);
router.get("/memberBorrowingsHistory/:memberId", getMemberBorrowingsHistory);
// Admin route
router.get("/overdue", getAllOverdueBorrowings);
// Member route
router.get("/overdue/:memberId", getMemberOverdueBorrowings);

// Softcopy downloads
router.post("/download", recordDownload);
router.get("/downloads/member/:memberId", getMemberDownloadHistory);
router.get("/downloads/all", getAllDownloadHistory);

export default router;
