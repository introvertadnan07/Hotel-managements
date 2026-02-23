import Wishlist from "../models/Wishlist.js";
import Room from "../models/Room.js";
import mongoose from "mongoose";

//  Toggle Wishlist
export const toggleWishlist = async (req, res) => {
  try {
    const { roomId } = req.body;

    // ✅ Validate input
    if (!roomId) {
      return res.status(400).json({
        success: false,
        message: "Room ID required",
      });
    }

    // ✅ Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Room ID",
      });
    }

    // ✅ Check room exists
    const roomExists = await Room.findById(roomId);
    if (!roomExists) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // ✅ Check existing wishlist item
    const existing = await Wishlist.findOne({
      user: req.user._id,
      room: roomId,
    });

    if (existing) {
      await existing.deleteOne();

      return res.json({
        success: true,
        message: "Removed from wishlist",
      });
    }

    // ✅ Create new wishlist item
    await Wishlist.create({
      user: req.user._id,
      room: roomId,
    });

    res.json({
      success: true,
      message: "Added to wishlist",
    });

  } catch (error) {
    console.error("Toggle wishlist error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// 📋 Get User Wishlist
export const getUserWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.find({
      user: req.user._id,
    }).populate({
      path: "room",
      populate: { path: "hotel" },
    });

    res.json({
      success: true,
      wishlist,
    });

  } catch (error) {
    console.error("Get wishlist error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};