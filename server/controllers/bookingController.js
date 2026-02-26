import Stripe from "stripe";
import Booking from "../models/Booking.js";
import Room from "../models/Room.js";
import Hotel from "../models/Hotel.js";
import User from "../models/User.js";
import path from "path";
import fs from "fs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

//
// ✅ CHECK AVAILABILITY
//
export const checkAvailabilityAPI = async (req, res) => {
  try {
    const { roomId, checkInDate, checkOutDate } = req.body;

    const existingBookings = await Booking.find({
      room: roomId,
      checkInDate: { $lte: checkOutDate },
      checkOutDate: { $gte: checkInDate },
    });

    const isAvailable = existingBookings.length === 0;

    res.json({
      success: true,
      isAvailable,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Availability check failed",
    });
  }
};

//
// ✅ CREATE BOOKING
//
export const createBooking = async (req, res) => {
  try {
    const { roomId, checkInDate, checkOutDate, guests } = req.body;

    const room = await Room.findById(roomId).populate("hotel");

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    const totalPrice = room.pricePerNight;

    const booking = await Booking.create({
      user: req.user.clerkId,
      hotel: room.hotel._id,
      room: room._id,
      checkInDate,
      checkOutDate,
      guests,
      totalPrice,
      isPaid: false,
    });

    res.json({
      success: true,
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Booking creation failed",
    });
  }
};

//
// ✅ USER BOOKINGS
//
export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      user: req.user.clerkId,
    })
      .populate("hotel")
      .populate("room")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
    });
  }
};

//
// ✅ HOTEL OWNER DASHBOARD BOOKINGS
//
export const getHotelBookings = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({
      owner: req.user.clerkId,
    });

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    const bookings = await Booking.find({
      hotel: hotel._id,
    })
      .populate("room")
      .populate("user")
      .sort({ createdAt: -1 });

    const totalBookings = bookings.length;
    const totalRevenue = bookings
      .filter((b) => b.isPaid)
      .reduce((sum, b) => sum + b.totalPrice, 0);

    res.json({
      success: true,
      dashboardData: {
        bookings,
        totalBookings,
        totalRevenue,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch hotel bookings",
    });
  }
};

//
// ✅ STRIPE PAYMENT SESSION
//
export const stripePayment = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId)
      .populate("room")
      .populate("hotel");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: `${booking.hotel.name} - ${booking.room.roomType}`,
            },
            unit_amount: booking.totalPrice * 100,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/my-bookings`,
      cancel_url: `${process.env.FRONTEND_URL}/my-bookings`,
      metadata: {
        bookingId: booking._id.toString(),
      },
    });

    res.json({
      success: true,
      url: session.url,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Stripe session creation failed",
    });
  }
};

//
// ✅ DOWNLOAD INVOICE
//
export const downloadInvoice = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);

    if (!booking || !booking.isPaid) {
      return res.status(404).json({
        success: false,
        message: "Invoice not available",
      });
    }

    const filePath = path.join("uploads", `invoice-${booking._id}.pdf`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "Invoice file not found",
      });
    }

    res.download(filePath);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Invoice download failed",
    });
  }
};