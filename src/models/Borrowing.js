import mongoose from "mongoose";

const BorrowingSchema = new mongoose.Schema({
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Member",
    required: true
  },
  libraryItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LibraryItem",
    required: true
  },

  borrowedAt: {
    type: Date,
    default: Date.now
  },

  dueDate: {
    type: Date,
    required: true
  },

  returnedAt: {
    type: Date,
    default: null
  },

  status: {
    type: String,
    enum: ["BORROWED", "RETURNED", "OVERDUE"],
    default: "BORROWED"
  }

}, { timestamps: true });

export default mongoose.model("Borrowing", BorrowingSchema);
