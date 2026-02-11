import Booking from "../models/Booking.js";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";

// check availability
const checkAvailability = async ({ checkInDate, checkOutDate, room }) => {
  const bookings = await Booking.find({
    room,
    checkInDate: { $lte: checkOutDate },
    checkOutDate: { $gte: checkInDate },
  });

  return bookings.length === 0;
};

// availability API
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

// create booking
export const createBooking = async (req, res) => {
  try {
    const { room, checkInDate, checkOutDate, guests } = req.body;
    const user = req.user._id;

    const isAvailable = await checkAvailability({
      room,
      checkInDate,
      checkOutDate,
    });

    if (!isAvailable) {
      return res.json({ success: false, message: "Room not available" });
    }

    const roomData = await Room.findById(room).populate("hotel");

    const nights = Math.ceil(
      (new Date(checkOutDate) - new Date(checkInDate)) /
        (1000 * 60 * 60 * 24)
    );

    const totalPrice = roomData.pricePerNight * nights;

    await Booking.create({
      user,
      room,
      hotel: roomData.hotel._id,
      guests,
      checkInDate,
      checkOutDate,
      totalPrice,
    });

    res.json({ success: true, message: "Booking created" });
  } catch (error) {
    res.json({ success: false, message: "Booking failed" });
  }
};

// user bookings
export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("room hotel")
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch {
    res.json({ success: false, message: "Failed to fetch bookings" });
  }
};

// owner bookings
export const getHotelBookings = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({ owner: req.user.clerkId });

    if (!hotel) {
      return res.json({ success: false, message: "Hotel not found" });
    }

    const bookings = await Booking.find({ hotel: hotel._id })
      .populate("room user hotel")
      .sort({ createdAt: -1 });

    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce(
      (sum, b) => sum + b.totalPrice,
      0
    );

    res.json({
      success: true,
      dashboardData: { totalBookings, totalRevenue, bookings },
    });
  } catch {
    res.json({ success: false, message: "Failed to fetch hotel bookings" });
  }
};
