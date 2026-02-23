import Wishlist from "../models/Wishlist.js";

export const toggleWishlist = async (req, res) => {
  try {
    const { roomId } = req.body;

    if (!roomId) {
      return res.json({
        success: false,
        message: "Room ID required",
      });
    }

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
    res.json({
      success: false,
      message: "Server error",
    });
  }
};

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
    res.json({
      success: false,
      message: "Server error",
    });
  }
};