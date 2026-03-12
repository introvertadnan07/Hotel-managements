import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
    },

    roomType: {
      type: String,
      required: true,
    },

    // ✅ NEW
    category: {
      type: String,
      enum: ["Budget", "Standard", "Premium", "Luxury"],
      default: "Standard",
    },

    // ✅ NEW
    description: {
      type: String,
      default: "",
      maxlength: 1000,
    },

    pricePerNight: {
      type: Number,
      required: true,
    },

    baseGuests: {
      type: Number,
      default: 2,
    },

    extraGuestPrice: {
      type: Number,
      default: 500,
    },

    maxGuests: {
      type: Number,
      default: 4,
    },

    beds: {
      type: Number,
      default: 1,
    },

    bathrooms: {
      type: Number,
      default: 1,
    },

    amenities: {
      type: [String],
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