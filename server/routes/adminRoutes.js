import express from "express";
import {
  getAdminStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllBookings,
  updateBookingStatus,
  getAllHotels,
  deleteHotel,
  toggleHotelVerified,
} from "../controllers/adminController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const adminRouter = express.Router();

// All admin routes are protected by both middlewares
adminRouter.use(protect, adminOnly);

// Stats
adminRouter.get("/stats", getAdminStats);

// Users
adminRouter.get("/users", getAllUsers);
adminRouter.put("/users/:id/role", updateUserRole);
adminRouter.delete("/users/:id", deleteUser);

// Bookings
adminRouter.get("/bookings", getAllBookings);
adminRouter.put("/bookings/:id/status", updateBookingStatus);

// Hotels
adminRouter.get("/hotels", getAllHotels);
adminRouter.delete("/hotels/:id", deleteHotel);
adminRouter.put("/hotels/:id/verify", toggleHotelVerified);

export default adminRouter;