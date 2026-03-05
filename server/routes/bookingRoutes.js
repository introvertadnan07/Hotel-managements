import express from "express";
import {
  checkAvailabilityAPI,
  createBooking,
  getUserBookings,
  stripePayment,
  cancelBooking,
} from "../controllers/bookingController.js";
import { protect } from "../middleware/authMiddleware.js";

const bookingRouter = express.Router();

bookingRouter.post("/check-availability", checkAvailabilityAPI);
bookingRouter.post("/book", protect, createBooking);
bookingRouter.post("/user", protect, getUserBookings);
bookingRouter.post("/stripe-payment", protect, stripePayment);
bookingRouter.post("/:id/cancel", protect, cancelBooking);

export default bookingRouter;