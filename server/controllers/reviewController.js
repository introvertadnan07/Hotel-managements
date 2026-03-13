import Review from "../models/Review.js";
import Booking from "../models/Booking.js";

// ✅ ADD REVIEW — only allowed after a completed, paid booking
export const addReview = async (req, res) => {
  try {
    const { roomId, rating, comment } = req.body;

    if (!roomId || !rating || !comment) {
      return res.json({ success: false, message: "Missing fields" });
    }

    // ✅ Must have a completed + paid booking for this room
    const bookingExists = await Booking.findOne({
      user:   req.user._id,
      room:   roomId,
      isPaid: true,
      status: "completed",
    });

    if (!bookingExists) {
      return res.json({
        success: false,
        message: "You can only review after your stay is completed",
      });
    }

    // ✅ Prevent duplicate reviews (one review per booking)
    const alreadyReviewed = await Review.findOne({
      user: req.user._id,
      room: roomId,
    });

    if (alreadyReviewed) {
      return res.json({
        success: false,
        message: "You have already reviewed this room",
      });
    }

    const review = await Review.create({
      user:    req.user._id,
      room:    roomId,
      rating,
      comment,
    });

    res.json({ success: true, review });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ✅ GET ALL REVIEWS FOR A ROOM
export const getRoomReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ room: req.params.roomId })
      .populate("user", "username image")
      .sort({ createdAt: -1 });

    res.json({ success: true, reviews });
  } catch (error) {
    res.json({ success: false });
  }
};

// ✅ CHECK IF USER CAN REVIEW — must have completed + paid booking, no existing review
export const canReviewRoom = async (req, res) => {
  try {
    if (!req.user) return res.json({ success: true, canReview: false });

    // Must have completed + paid booking
    const bookingExists = await Booking.findOne({
      user:   req.user._id,
      room:   req.params.roomId,
      isPaid: true,
      status: "completed",
    });

    if (!bookingExists) {
      return res.json({ success: true, canReview: false });
    }

    // Must not have already reviewed
    const alreadyReviewed = await Review.findOne({
      user: req.user._id,
      room: req.params.roomId,
    });

    res.json({ success: true, canReview: !alreadyReviewed });

  } catch {
    res.json({ success: false, canReview: false });
  }
};