import express from "express";

import {
  checkAvailabilityAPI,
  createBooking,
  getUserBookings,
  getHotelBookings,
  stripePayment,
  cancelBooking,
} from "../controllers/bookingController.js";

import { protect } from "../middleware/authMiddleware.js";

const bookingRouter = express.Router();

//
// CHECK ROOM AVAILABILITY
//
bookingRouter.post("/check-availability", checkAvailabilityAPI);

//
// CREATE BOOKING
//
bookingRouter.post("/book", protect, createBooking);

//
// GET USER BOOKINGS
//
bookingRouter.post("/user", protect, getUserBookings);

//
// GET HOTEL OWNER BOOKINGS (Dashboard)
//
bookingRouter.post("/hotel", protect, getHotelBookings);

//
// STRIPE PAYMENT
//
bookingRouter.post("/stripe-payment", protect, stripePayment);

//
// CANCEL BOOKING
//
bookingRouter.post("/:id/cancel", protect, cancelBooking);

export default bookingRouter;