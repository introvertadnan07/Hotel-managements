import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    hotel: {
      type: mongoose.Schema.Types.ObjectId, // ✅ FIXED
      ref: "Hotel",
      required: true,
    },

    roomType: {
      type: String,
      required: true,
    },

    pricePerNight: {
      type: Number, // ✅ FIXED
      required: true,
    },

    amenities: {
      type: [String], // ✅ FIXED (THIS SOLVES YOUR ERROR)
      default: [],
    },

    images: {
      type: [String],
      default: [],
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Room = mongoose.model("Room", roomSchema);

export default Room;
