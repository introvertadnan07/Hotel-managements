import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import {
  createRoom,
  getRooms,
  getOwnerRooms,
  toggleRoomAvailability,   // 👈 ADD THIS
} from "../controllers/roomController.js";
import { protect } from "../middleware/authMiddleware.js";

const roomRouter = express.Router();

// create room (owner)
roomRouter.post(
  "/",
  protect,
  upload.array("images", 4),
  createRoom
);

// get all rooms (public)
roomRouter.get("/", getRooms);

// get rooms of logged-in hotel owner
roomRouter.get("/owner", protect, getOwnerRooms);

// ✅ TOGGLE AVAILABILITY
roomRouter.post(
  "/toggle-availability",
  protect,
  toggleRoomAvailability
);

export default roomRouter;
