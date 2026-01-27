import mongoose from "mongoose";

const LibraryItemSchema = new mongoose.Schema({
   bookIdNumber: {
    type: String,
    required: true,
    unique: true,     
    index: true
  },
  title: { type: String, required: true },
  titleAmharic: String,
  authorName: String,
  authorAmharicName: String,
  category: String,
  description: String,

  bookCoverPic: String, // optional

  hardCopyTotal: {
    type: Number,
    required: function () {
      return !this.isSoftCopy;
    }
  },
  hardCopyAvailable: {
  type: Number,
  default: function () {
    // if this is a hard copy item, set available = total
    return this.isSoftCopy ? 0 : this.hardCopyTotal;
  },
  required: function () {
    return !this.isSoftCopy; // required only for hard copy
  }
},

  isSoftCopy: { type: Boolean },

  filePath: {
    type: String,
    required: function () {
      return this.isSoftCopy;
    }
  }

}, { timestamps: true });

// Pre-save hook to set hardCopyAvailable automatically
LibraryItemSchema.pre("save", function () {
  if (!this.isSoftCopy && (this.hardCopyAvailable === undefined || this.hardCopyAvailable === null)) {
    this.hardCopyAvailable = this.hardCopyTotal;
  }
});

const LibraryItem = mongoose.model("LibraryItem", LibraryItemSchema);
export default LibraryItem;
