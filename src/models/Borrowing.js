import mongoose from "mongoose";

const BorrowingSchema =new mongoose.Schema({
memberId: {
type: mongoose.Schema.Types.ObjectId,
ref:"Member"
  },
libraryItemId: {
type: mongoose.Schema.Types.ObjectId,
ref:"LibraryItem"
  },
borrowedDate:Date,
dueDate:Date,
returnedDate:Date,
reminderSent:Boolean
}, {timestamps:true });

const Borrowing = mongoose.model('Borrowing',BorrowingSchema);
export default Borrowing;
