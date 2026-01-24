import mongoose from "mongoose";

const AccessHistorySchema =new mongoose.Schema({
memberId: {
type: mongoose.Schema.Types.ObjectId,
ref:"Member"
  },
libraryItemId: {
type: mongoose.Schema.Types.ObjectId,
ref:"LibraryItem"
  },
accessType:String
}, {timestamps:true });

const AccessHistory = mongoose.model('AccessHistory',AccessHistorySchema)

export default AccessHistory;