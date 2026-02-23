import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
  },
  { timestamps: true }
);

// ✅ Prevent duplicate wishlist items
wishlistSchema.index({ user: 1, room: 1 }, { unique: true });

const Wishlist = mongoose.model("Wishlist", wishlistSchema);

export default Wishlist;