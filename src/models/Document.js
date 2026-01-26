import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true
    },

    title: {
      type: String,
      required: true
    },

    documentType: {
      type: String 
    },

    documentNumber: {
      type: String
    },

    // Cloudinary secure URL
    filePath: {
      type: String,
      required: true
    },

    // pdf, image/jpeg, image/png, etc
    fileType: {
      type: String
    },

    documentSource: {
      type: String, //curch or member 
    },

    // Who uploaded it (admin or member)
    uploadedByMemberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member"
    }
  },
  { timestamps: true }
);

const Document = mongoose.model("Document", DocumentSchema);
export default Document;
