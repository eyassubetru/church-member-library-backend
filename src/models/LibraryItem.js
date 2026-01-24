import mongoose from "mongoose";

const LibraryItemSchema =new mongoose.Schema({
title:String,
titleAmharic:String,
authorName:String,
category:String,
description:String,

bookCoverPic: String,

hardCopyTotal: Number,
hardCopyAvailable:Number,

isSoftCopy:Boolean,
filePath:String
}, {timestamps:true });



const LibraryItem = mongoose.model('LibraryItem', LibraryItemSchema)
export default LibraryItem;