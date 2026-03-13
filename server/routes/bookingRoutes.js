import express from "express";
import {
  checkAvailabilityAPI,
  createBooking,
  getUserBookings,
  getHotelBookings,
  stripePayment,
  cancelBooking,
  downloadInvoice,
  validateCoupon,
  getBookedDates,
  modifyBooking,
} from "../controllers/bookingController.js";
import { protect } from "../middleware/authMiddleware.js";

const bookingRouter = express.Router();

bookingRouter.post("/check-availability", checkAvailabilityAPI);
bookingRouter.post("/book", protect, createBooking);
bookingRouter.get("/user", protect, getUserBookings);
bookingRouter.get("/hotel", protect, getHotelBookings);
bookingRouter.post("/stripe-payment", protect, stripePayment);
bookingRouter.post("/cancel/:id", protect, cancelBooking);
bookingRouter.get("/invoice/:id", protect, downloadInvoice);
bookingRouter.post("/validate-coupon", protect, validateCoupon);
bookingRouter.get("/booked-dates/:roomId", getBookedDates);    // ✅ public — no auth
bookingRouter.post("/modify", protect, modifyBooking);          // ✅ new — modify dates

export default bookingRouter;