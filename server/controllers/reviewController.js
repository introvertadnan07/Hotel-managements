import Review from "../models/Review.js";
import Booking from "../models/Booking.js";

export const addReview = async (req, res) => {
  try {
    const { roomId, rating, comment } = req.body;

    if (!roomId || !rating || !comment) {
      return res.json({ success: false, message: "Missing fields" });
    }

    // ✅ Allow only after booking
    const bookingExists = await Booking.findOne({
      user: req.user._id,
      room: roomId,
      isPaid: true,
    });

    if (!bookingExists) {
      return res.json({
        success: false,
        message: "You can review only after booking this room",
      });
    }

    const review = await Review.create({
      user: req.user._id,
      room: roomId,
      rating,
      comment,
    });

    res.json({ success: true, review });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getRoomReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ room: req.params.roomId })
      .populate("user", "username image");

    res.json({ success: true, reviews });

  } catch (error) {
    res.json({ success: false });
  }
};

export const canReviewRoom = async (req, res) => {
  try {
    const bookingExists = await Booking.findOne({
      user: req.user._id,
      room: req.params.roomId,
      isPaid: true,
    });

    res.json({ success: true, canReview: !!bookingExists });

  } catch {
    res.json({ success: false });
  }
};