import Booking from "../models/Booking.js";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";

// 🔹 Check availability helper
const checkAvailability = async ({ checkInDate, checkOutDate, room }) => {
  const bookings = await Booking.find({
    room,
    checkInDate: { $lte: checkOutDate },
    checkOutDate: { $gte: checkInDate },
  });

  return bookings.length === 0;
};

// ✅ Availability API
export const checkAvailabilityAPI = async (req, res) => {
  try {
    const { room, checkInDate, checkOutDate } = req.body;

    const isAvailable = await checkAvailability({
      room,
      checkInDate,
      checkOutDate,
    });

    res.json({ success: true, isAvailable });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ✅ Create booking
export const createBooking = async (req, res) => {
  try {
    const { room, checkInDate, checkOutDate, guests } = req.body;

    const userId = req.user._id;

    const isAvailable = await checkAvailability({
      room,
      checkInDate,
      checkOutDate,
    });

    if (!isAvailable) {
      return res.json({
        success: false,
        message: "Room not available",
      });
    }

    const roomData = await Room.findById(room).populate("hotel");

    if (!roomData) {
      return res.json({
        success: false,
        message: "Room not found",
      });
    }

    const nights = Math.ceil(
      (new Date(checkOutDate) - new Date(checkInDate)) /
        (1000 * 60 * 60 * 24)
    );

    const totalPrice = roomData.pricePerNight * nights;

    await Booking.create({
      user: userId,
      room,
      hotel: roomData.hotel._id,
      guests,
      checkInDate,
      checkOutDate,
      totalPrice,
    });

    res.json({
      success: true,
      message: "Booking created successfully",
    });
  } catch (error) {
    console.error("Create booking error:", error);
    res.json({
      success: false,
      message: "Booking failed",
    });
  }
};

// ✅ User bookings
export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("room hotel")
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    res.json({
      success: false,
      message: "Failed to fetch bookings",
    });
  }
};

// ✅ Hotel Owner Dashboard
export const getHotelBookings = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({ owner: req.user.clerkId });

    if (!hotel) {
      return res.json({
        success: true,
        dashboardData: {
          bookings: [],
          totalBookings: 0,
          totalRevenue: 0,
        },
      });
    }

    const bookings = await Booking.find({ hotel: hotel._id })
      .populate("room user")
      .sort({ createdAt: -1 });

    const totalBookings = bookings.length;

    const totalRevenue = bookings.reduce(
      (sum, booking) => sum + booking.totalPrice,
      0
    );

    res.json({
      success: true,
      dashboardData: {
        bookings,
        totalBookings,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error("Hotel bookings error:", error);
    res.json({
      success: false,
      message: "Failed to fetch hotel bookings",
    });
  }
};
