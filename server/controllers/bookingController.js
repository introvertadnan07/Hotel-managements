import Stripe from "stripe";
import Booking from "../models/Booking.js";
import Room from "../models/Room.js";
import Hotel from "../models/Hotel.js";
import Coupon from "../models/Coupon.js";
import User from "../models/User.js";
import { generateInvoicePDF } from "../utils/generateInvoice.js";
import { sendBookingConfirmationEmail } from "../utils/sendBookingEmail.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

//
// CHECK AVAILABILITY
//
export const checkAvailabilityAPI = async (req, res) => {
  try {
    const { roomId, checkInDate, checkOutDate } = req.body;
    const existingBookings = await Booking.find({
      room: roomId,
      status: { $in: ["pending", "confirmed"] },
      checkInDate: { $lt: checkOutDate },
      checkOutDate: { $gt: checkInDate },
    });
    res.json({ success: true, isAvailable: existingBookings.length === 0 });
  } catch {
    res.status(500).json({ success: false });
  }
};

//
// ✅ VALIDATE COUPON
//
export const validateCoupon = async (req, res) => {
  try {
    const { code, total } = req.body;

    if (!code) return res.status(400).json({ success: false, message: "Coupon code required" });

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon || !coupon.isActive)
      return res.status(400).json({ success: false, message: "Invalid coupon code" });

    if (coupon.expiryDate < new Date())
      return res.status(400).json({ success: false, message: "Coupon has expired" });

    if (coupon.usedCount >= coupon.maxUsage)
      return res.status(400).json({ success: false, message: "Coupon usage limit reached" });

    let discount = 0;
    if (coupon.discountType === "percent") {
      discount = (total * coupon.discountValue) / 100;
    } else {
      discount = coupon.discountValue;
    }

    const newTotal = Math.max(total - discount, 0);

    res.json({
      success: true,
      discount,
      newTotal,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      message: coupon.discountType === "percent"
        ? `${coupon.discountValue}% off applied!`
        : `₹${coupon.discountValue} off applied!`,
    });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//
// CREATE BOOKING
//
export const createBooking = async (req, res) => {
  try {
    const { roomId, checkInDate, checkOutDate, guests, couponCode } = req.body;

    const room = await Room.findById(roomId).populate("hotel");
    if (!room) return res.status(404).json({ success: false, message: "Room not found" });

    const overlapping = await Booking.findOne({
      room: roomId,
      status: { $in: ["pending", "confirmed"] },
      checkInDate: { $lt: checkOutDate },
      checkOutDate: { $gt: checkInDate },
    });

    if (overlapping)
      return res.status(400).json({ success: false, message: "Room already booked" });

    const nights = (new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24);
    let total = nights * room.pricePerNight;

    const baseGuests = room.baseGuests || 2;
    const extraGuestPrice = room.extraGuestPrice || 500;

    if (guests > baseGuests) {
      total += (guests - baseGuests) * extraGuestPrice * nights;
    }

    // ✅ Apply coupon
    let appliedCoupon = null;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });

      if (!coupon || !coupon.isActive || coupon.expiryDate < new Date() || coupon.usedCount >= coupon.maxUsage) {
        return res.status(400).json({ success: false, message: "Invalid or expired coupon" });
      }

      if (coupon.discountType === "percent") {
        total -= (total * coupon.discountValue) / 100;
      } else {
        total -= coupon.discountValue;
      }

      coupon.usedCount += 1;
      await coupon.save();
      appliedCoupon = coupon.code;
    }

    if (total < 0) total = 0;

    const booking = await Booking.create({
      user: req.user._id,
      hotel: room.hotel._id,
      room: room._id,
      checkInDate,
      checkOutDate,
      guests,
      totalPrice: total,
      status: "pending",
      couponCode: appliedCoupon,
    });

    res.json({ success: true, booking });
  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({ success: false });
  }
};

//
// USER BOOKINGS
//
export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("hotel")
      .populate("room")
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch {
    res.status(500).json({ success: false });
  }
};

//
// HOTEL OWNER BOOKINGS
//
export const getHotelBookings = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({ owner: req.user.clerkId });
    if (!hotel) return res.status(404).json({ success: false, message: "Hotel not found" });

    const bookings = await Booking.find({ hotel: hotel._id })
      .populate("user")
      .populate("room")
      .sort({ createdAt: -1 });

    const totalBookings = bookings.length;
    const totalRevenue = bookings
      .filter((b) => b.isPaid)
      .reduce((sum, b) => sum + b.totalPrice, 0);

    res.json({ success: true, dashboardData: { bookings, totalBookings, totalRevenue } });
  } catch {
    res.status(500).json({ success: false });
  }
};

//
// STRIPE PAYMENT
//
export const stripePayment = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId).populate("room").populate("hotel");
    if (!booking) return res.status(404).json({ success: false });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: { name: `${booking.hotel.name} - ${booking.room.roomType}` },
            unit_amount: Math.round(booking.totalPrice * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/my-bookings`,
      cancel_url: `${process.env.FRONTEND_URL}/my-bookings`,
      metadata: { bookingId: booking._id.toString() },
    });

    booking.stripeSessionId = session.id;
    await booking.save();

    res.json({ success: true, url: session.url });
  } catch {
    res.status(500).json({ success: false });
  }
};

//
// CANCEL BOOKING
//
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false });

    if (booking.user.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false });

    if (!["pending", "confirmed"].includes(booking.status))
      return res.status(400).json({ success: false, message: "Booking cannot be cancelled" });

    if (booking.stripePaymentIntentId) {
      await stripe.refunds.create({ payment_intent: booking.stripePaymentIntentId });
    }

    booking.status = "refunded";
    booking.isPaid = false;
    await booking.save();

    res.json({ success: true, message: "Booking cancelled successfully" });
  } catch {
    res.status(500).json({ success: false });
  }
};

//
// DOWNLOAD INVOICE
//
export const downloadInvoice = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("user")
      .populate("room")
      .populate("hotel");

    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    if (booking.user._id.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Not authorized" });
    if (!booking.isPaid)
      return res.status(400).json({ success: false, message: "Invoice only available for paid bookings" });

    const pdfBuffer = await generateInvoicePDF(booking, booking.user, booking.room);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=invoice-${booking._id}.pdf`,
      "Content-Length": pdfBuffer.length,
    });

    res.send(pdfBuffer);
  } catch (error) {
    console.error("Invoice error:", error);
    res.status(500).json({ success: false, message: "Invoice generation failed" });
  }
};

//
// ✅ SEND CONFIRMATION EMAIL (called from stripeWebhooks after payment)
//
export const sendConfirmationEmail = async (bookingId) => {
  try {
    const booking = await Booking.findById(bookingId).populate("room").populate("hotel");
    const user = await User.findById(booking.user);
    if (!user?.email) return;
    await sendBookingConfirmationEmail(booking, user, booking.room, booking.hotel);
  } catch (error) {
    console.error("Confirmation email error:", error);
  }
};