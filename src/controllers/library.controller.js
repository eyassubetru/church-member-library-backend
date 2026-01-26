import LibraryItem from "../models/LibraryItem.js";
import { uploadLibraryItemToCloudinary, deleteLibraryItemFromCloudinary } from "../utils/cloudinary.js";

/* ================= ADMIN ================= */

// CREATE library item
export const createLibraryItem = async (req, res) => {
  try {
    const data = req.body;

    // If soft copy, upload file
    if (data.isSoftCopy && req.file) {
      const url = await uploadLibraryItemToCloudinary(req.file.path);
      data.filePath = url;
    }

    const item = await LibraryItem.create(data);
    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};

// UPDATE library item
export const updateLibraryItem = async (req, res) => {
  try {
    const item = await LibraryItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    // If soft copy and new file uploaded, delete old and upload new
    if (req.file && item.isSoftCopy) {
      await deleteLibraryItemFromCloudinary(item.filePath);
      const url = await uploadLibraryItemToCloudinary(req.file.path);
      req.body.filePath = url;
    }

    const updated = await LibraryItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};

// DELETE library item
export const deleteLibraryItem = async (req, res) => {
  try {
    const item = await LibraryItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (item.isSoftCopy) await deleteLibraryItemFromCloudinary(item.filePath);

    await LibraryItem.findByIdAndDelete(req.params.id);
    res.json({ message: "Library item deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

/* ================= USERS ================= */

// GET ALL
export const getAllLibrary = async (req, res) => {
  const items = await LibraryItem.find().sort({ createdAt: -1 });
  res.json(items);
};

// GET BY NAME
export const getLibraryByName = async (req, res) => {
  const { name } = req.params;
  const items = await LibraryItem.find({ title: { $regex: name, $options: "i" } });
  res.json(items);
};

// GET ALL BOOKS
export const getAllBooks = async (req, res) => {
  const books = await LibraryItem.find({ itemType: "book" });
  res.json(books);
};

// GET ALL MAGAZINES
export const getAllMagazines = async (req, res) => {
  const magazines = await LibraryItem.find({ itemType: "magazine" });
  res.json(magazines);
};

// GET ALL TEACHINGS
export const getAllTeachings = async (req, res) => {
  const teachings = await LibraryItem.find({ itemType: "teaching" });
  res.json(teachings);
};
export const getsoftcopy = async (req, res) => {
  try {
    const softCopies = await LibraryItem.find({ isSoftCopy: true });
    res.status(200).json(softCopies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch soft copies" });
  }
};

// Get all hard copies (info only, no files)
export const gethardcopy = async (req, res) => {
  try {
    const hardCopies = await LibraryItem.find({ isSoftCopy: false });
    res.status(200).json(hardCopies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch hard copies" });
  }
};