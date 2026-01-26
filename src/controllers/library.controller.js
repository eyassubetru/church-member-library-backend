import LibraryItem from "../models/LibraryItem.js";
import { uploadLibraryItemToCloudinary, deleteLibraryItemFromCloudinary } from "../utils/cloudinary.js";

/* ================= ADMIN ================= */

// CREATE library item
export const createLibraryItem = async (req, res) => {
  try {
    const data = req.body;

    // Check if soft copy exists and upload
    if (req.files?.file?.[0]) {
      const url = await uploadLibraryItemToCloudinary(req.files.file[0].path);
      data.filePath = url;
      data.isSoftCopy = true;
    } else {
      data.isSoftCopy = false;
      data.filePath = null;
    }

    // Check if cover exists and upload
    if (req.files?.cover?.[0]) {
      const coverUrl = await uploadLibraryItemToCloudinary(req.files.cover[0].path);
      data.bookCoverPic = coverUrl;
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
    const itemId = req.params.id;
    const data = req.body;

    // Fetch existing item
    const existingItem = await LibraryItem.findById(itemId);
    if (!existingItem) return res.status(404).json({ message: "Library item not found" });

    // Soft copy
    if (req.files?.file?.[0]) {
      // Delete previous soft copy from Cloudinary
      if (existingItem.filePath) {
        await deleteLibraryItemFromCloudinary(existingItem.filePath, "library_items");
      }

      // Upload new soft copy
      const url = await uploadLibraryItemToCloudinary(req.files.file[0].path, "library_items");
      data.filePath = url;
      data.isSoftCopy = true;
    }

    // Cover page
    if (req.files?.cover?.[0]) {
      // Delete previous cover from Cloudinary
      if (existingItem.bookCoverPic) {
        await deleteLibraryItemFromCloudinary(existingItem.bookCoverPic);
      }

      // Upload new cover
      const coverUrl = await uploadLibraryItemToCloudinary(req.files.cover[0].path);
      data.bookCoverPic = coverUrl;
    }

    const updatedItem = await LibraryItem.findByIdAndUpdate(itemId, data, { new: true });
    res.json(updatedItem);

  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};


// DELETE library item
export const deleteLibraryItem = async (req, res) => {
  try {
    const item = await LibraryItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Library item not found" });

    // Delete files from Cloudinary if they exist
    if (item.filePath) await deleteLibraryItemFromCloudinary(item.filePath);
    if (item.bookCoverPic) await deleteLibraryItemFromCloudinary(item.bookCoverPic);

    // Delete the document from MongoDB
    await LibraryItem.deleteOne({ _id: item._id });

    res.status(200).json({ message: "Library item deleted successfully" });

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