import express from "express";
import {
  checkAvailabilityAPI,
  createBooking,
  getHotelBookings,
  getUserBookings,
  stripePayment,
  downloadInvoice,
} from "../controllers/bookingController.js";

import { protect } from "../middleware/authMiddleware.js";

const bookingRouter = express.Router();

// Availability
bookingRouter.post("/check-availability", checkAvailabilityAPI);

// Create Booking
bookingRouter.post("/book", protect, createBooking);

// User bookings
bookingRouter.post("/user", protect, getUserBookings);

// Owner dashboard
bookingRouter.post("/hotel", protect, getHotelBookings);

// Stripe payment
bookingRouter.post("/stripe-payment", protect, stripePayment);

// Invoice download
bookingRouter.get("/invoice/:bookingId", protect, downloadInvoice);

export default bookingRouter;