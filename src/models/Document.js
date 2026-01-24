import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema({
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Member",
        required: true
    },
    title: String,
    documentType: String,
    documentNumber: String,
    filePath: String,
    fileType: String,
    uploadedByAdminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true });

const Document = mongoose.model('Document', DocumentSchema);
export default Document;