import mongoose from "mongoose";

const LibraryItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  titleAmharic: String,

  authorName: String,
  authorAmharicName: String,

  itemType: {
    type: String,
    required: true
  },

  category: String,
  description: String,

  bookCoverPic: String, // Cloudinary URL

  hardCopyTotal: { type: Number, default: 0 },
  hardCopyAvailable: { type: Number, default: 0 },

  isSoftCopy: { type: Boolean, default: false },

  filePath: {
    type: String,
    required: function () {
      return this.isSoftCopy;
    }
  }
}, { timestamps: true });

const LibraryItem = mongoose.model("LibraryItem", LibraryItemSchema);
export default LibraryItem;
