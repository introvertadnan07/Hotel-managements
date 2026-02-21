import express from "express";
import {
  checkAvailabilityAPI,
  createBooking,
  getHotelBookings,
  getUserBookings,
  stripePayment,
} from "../controllers/bookingController.js";

import { protect } from "../middleware/authMiddleware.js";

const bookingRouter = express.Router();

// Availability
bookingRouter.post("/check-availability", checkAvailabilityAPI);

// Booking
bookingRouter.post("/book", protect, createBooking);

// User bookings
bookingRouter.post("/user", protect, getUserBookings);

// Hotel owner dashboard
bookingRouter.post("/hotel", protect, getHotelBookings);

// Stripe payment
bookingRouter.post("/stripe-payment", protect, stripePayment);

export default bookingRouter;