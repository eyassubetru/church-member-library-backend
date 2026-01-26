import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export const uploadToCloudinary = async (file, folder = "church_documents") => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder
    });
    return result.secure_url; // returns the Cloudinary URL
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};


export const deleteFromCloudinary = async (url) => {
    try {
    // Get public_id from URL (after folder name, before extension)
    const parts = url.split("/");
    const fileName = parts[parts.length - 1]; // e.g., abc123.jpg
    const publicId = `church_documents/${fileName.split(".")[0]}`; // remove extension

    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw error;
  }
};
