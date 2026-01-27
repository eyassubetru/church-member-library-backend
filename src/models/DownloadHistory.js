import mongoose from "mongoose";

const DownloadHistorySchema = new mongoose.Schema({
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
  downloadedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export default mongoose.model("DownloadHistory", DownloadHistorySchema);
