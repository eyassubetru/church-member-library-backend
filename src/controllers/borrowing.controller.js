import Borrowing from "../models/Borrowing.js";
import Member from "../models/Member.js";
import LibraryItem from "../models/LibraryItem.js";
import DownloadHistory from "../models/DownloadHistory.js";

// Create a borrowing
// Create a borrowing
export const createBorrowing = async (req, res) => {
  try {
    const { memberIdNumber, bookIdNumber, dueDate } = req.body;

    // Find the member by church-assigned idNumber
    const member = await Member.findOne({ idNumber: memberIdNumber });
    if (!member) return res.status(404).json({ message: "Member not found" });

    // Find the library item by bookIdNumber
    const item = await LibraryItem.findOne({ bookIdNumber });
    if (!item) return res.status(404).json({ message: "Library item not found" });

    // For hard copies, check availability
    if (!item.isSoftCopy) {
      if (item.hardCopyAvailable < 1)
        return res.status(400).json({ message: "No copies available" });

      item.hardCopyAvailable -= 1;
      await item.save();
    }

    // Set dueDate to 2 weeks from today if not provided
    const finalDueDate = dueDate
      ? new Date(dueDate)
      : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days

    // Create the borrowing with MongoDB references
    const borrowing = await Borrowing.create({
      member: member._id,       // MongoDB ObjectId
      libraryItem: item._id,
      dueDate: finalDueDate
    });

    res.status(201).json({ message: "Borrowing created", borrowing });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};

// Delete borrowing
export const deleteBorrowing = async (req, res) => {
  try {
    const borrowing = await Borrowing.findById(req.params.id);
    if (!borrowing) return res.status(404).json({ message: "Borrowing not found" });

    // For hard copy, return to stock if not returned
    const item = await LibraryItem.findById(borrowing.libraryItemId);
    if (item && !item.isSoftCopy && borrowing.status !== "RETURNED") {
      item.hardCopyAvailable += 1;
      await item.save();
    }

    // Instead of deleting, mark as returned (or archived)
    borrowing.status = "RETURNED";
    await borrowing.save();

    res.json({ message: "Borrowing marked as returned (history preserved)" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all borrowings
export const getAllBorrowings = async (req, res) => {
  try {
    const borrowings = await Borrowing.find({ status: "BORROWED" }) // filter by BORROWED
      .populate("member", "name idNumber email")        // reference field is 'member'
      .populate("libraryItem", "title bookCoverPic isSoftCopy"); // reference field is 'libraryItem'

    res.json(borrowings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Get member borrowings
export const getMemberBorrowings = async (req, res) => {
  try {
    const borrowings = await Borrowing.find({ memberId: req.params.memberId })
      .populate("libraryItemId", "title filePath isSoftCopy");
    res.json(borrowings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Mark soft copy downloaded
export const recordDownload = async (req, res) => {
  try {
    const { memberId, libraryItemId } = req.body;

    if (!memberId || !libraryItemId) {
      return res.status(400).json({ message: "memberId and libraryItemId are required" });
    }

    const history = await DownloadHistory.create({
      member: memberId,
      libraryItem: libraryItemId
    });

    res.status(201).json({ message: "Download recorded", history });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
export const markOverdueBorrowings = async () => {
  const now = new Date();
  await Borrowing.updateMany(
    { dueDate: { $lt: now }, status: "borrowed" },
    { status: "overdue" }
  );
};
export const getMemberDownloadHistory = async (req, res) => {
  try {
    const memberId = req.params.memberId;

    const history = await DownloadHistory.find({ member: memberId })
      .populate("libraryItem", "title bookCoverPic") // optional: show book details
      .sort({ downloadedAt: -1 });

    res.json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
export const getAllDownloadHistory = async (req, res) => {
  try {
    const history = await DownloadHistory.find()
      .populate("member", "name idNumber email") // show member info
      .populate("libraryItem", "title bookCoverPic") // show book info
      .sort({ downloadedAt: -1 }); // newest first

    res.json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
export const getAllBorrowingsHistory = async (req, res) => {
  try {
    const borrowings = await Borrowing.find({ status: "RETURNED" })
      .populate("member", "name idNumber email")
      .populate("libraryItem", "title bookCoverPic isSoftCopy")
      .sort({ returnedAt: -1 }); // newest returned first

    res.json(borrowings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
export const getMemberBorrowingsHistory = async (req, res) => {
  try {
    const memberMongoId = req.params.memberId; // MongoDB _id

    const borrowings = await Borrowing.find({ member: memberMongoId, status: "RETURNED" })
      .populate("libraryItem", "title bookCoverPic isSoftCopy")
      .sort({ returnedAt: -1 });

    res.json(borrowings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
export const getAllOverdueBorrowings = async (req, res) => {
  try {
    const borrowings = await Borrowing.find({ status: "OVERDUE" }) // filter by OVERDUE
      .populate("member", "name idNumber email")        // reference field is 'member'
      .populate("libraryItem", "title bookCoverPic isSoftCopy"); // reference field is 'libraryItem'

    res.json(borrowings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const getMemberOverdueBorrowings = async (req, res) => {
  try {
    const memberId = req.params.memberId; // MongoDB _id of the member

    const borrowings = await Borrowing.find({ member: memberId, status: "OVERDUE" })
      .populate("libraryItem", "title bookCoverPic isSoftCopy"); // book info only

    res.json(borrowings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};