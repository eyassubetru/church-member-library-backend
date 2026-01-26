import express from "express";
import multer from "multer";
import {
  createLibraryItem,
  updateLibraryItem,
  deleteLibraryItem,
  getAllLibrary,
  getLibraryByName,
  getAllBooks,
  getAllMagazines,
  getAllTeachings,
  gethardcopy,
  getsoftcopy
} from "../controllers/library.controller.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // temp storage before Cloudinary

/* ADMIN */
router.post("/", upload.single("file"), createLibraryItem);
router.put("/:id", upload.single("file"), updateLibraryItem);
router.delete("/:id", deleteLibraryItem);

/* USERS */
router.get("/", getAllLibrary);
router.get("/search/:name", getLibraryByName);
router.get("/books/all", getAllBooks);
router.get("/magazines/all", getAllMagazines);
router.get("/teachings/all", getAllTeachings);
router.get("/softcopies", getsoftcopy);
router.get("/hardcopies", gethardcopy);

export default router;
