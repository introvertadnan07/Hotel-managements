import { v2 as cloudinary } from "cloudinary";

export const uploadToCloudinary = (buffer, folder = "rooms") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );

    stream.end(buffer);
  });
};