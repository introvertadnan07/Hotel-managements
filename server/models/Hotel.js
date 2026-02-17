import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema(
  {
    name: String,
    address: String,
    city: String,
    contact: String,
    owner: {
      type: String, // Clerk userId
      required: true,
    },
  },
  { timestamps: true }
);

const Hotel = mongoose.model("Hotel", hotelSchema);
export default Hotel;
