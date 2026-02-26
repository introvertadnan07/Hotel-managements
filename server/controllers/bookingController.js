import Stripe from "stripe";
import PDFDocument from "pdfkit";
import Booking from "../models/Booking.js";
import Room from "../models/Room.js";
import Hotel from "../models/Hotel.js";

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

    res.json({
      success: true,
      isAvailable: existingBookings.length === 0,
    });
  } catch (error) {
    console.error("Availability error:", error);
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

    const booking = await Booking.create({
      user: req.user._id, // ✅ IMPORTANT FIX
      hotel: room.hotel._id,
      room: room._id,
      checkInDate,
      checkOutDate,
      guests,
      totalPrice: room.pricePerNight,
      isPaid: false,
    });

    res.json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error("Create booking error:", error);
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
      user: req.user._id, // ✅ FIXED
    })
      .populate("hotel")
      .populate("room")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error("User bookings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
    });
  }
};

//
// ✅ HOTEL OWNER DASHBOARD
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
      .populate("user") // ✅ now works because user is ObjectId
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
    console.error("Hotel dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch hotel bookings",
    });
  }
};

//
// ✅ STRIPE PAYMENT
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
    console.error("Stripe error:", error);
    res.status(500).json({
      success: false,
      message: "Stripe session creation failed",
    });
  }
};

//
// ✅ STREAMING INVOICE (VERCEL SAFE)
//
export const downloadInvoice = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId)
      .populate("room")
      .populate("hotel")
      .populate("user");

    if (!booking || !booking.isPaid) {
      return res.status(404).json({
        success: false,
        message: "Invoice not available",
      });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${booking._id}.pdf`
    );

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    doc.fontSize(22).text("Anumifly Invoice", { align: "center" });
    doc.moveDown();

    doc.fontSize(12);
    doc.text(`Booking ID: ${booking._id}`);
    doc.text(`Customer: ${booking.user.username}`);
    doc.text(`Hotel: ${booking.hotel.name}`);
    doc.text(`Room: ${booking.room.roomType}`);
    doc.text(`Total Amount: ₹${booking.totalPrice}`);
    doc.text(`Status: Paid`);
    doc.moveDown();
    doc.text(`Check-In: ${new Date(booking.checkInDate).toDateString()}`);
    doc.text(`Check-Out: ${new Date(booking.checkOutDate).toDateString()}`);

    doc.end();
  } catch (error) {
    console.error("Invoice error:", error);
    res.status(500).json({
      success: false,
      message: "Invoice generation failed",
    });
  }
};