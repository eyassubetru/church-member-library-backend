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
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"), // temp folder
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ dest: "uploads/" }); // temp storage before Cloudinary

/* ADMIN */
router.post(
  "/",
  upload.fields([
    { name: "file", maxCount: 1 },   // for soft copy
    { name: "cover", maxCount: 1 },  // for cover image
  ]),
  createLibraryItem
)
router.put(
  "/:id",
  upload.fields([
    { name: "file", maxCount: 1 },   // soft copy
    { name: "cover", maxCount: 1 }   // cover image
  ]),
  updateLibraryItem
);
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
