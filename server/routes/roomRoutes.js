import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import {
  createRoom,
  getRooms,
  getOwnerRooms,
  getRoomById,
  toggleRoomAvailability,
} from "../controllers/roomController.js";
import { protect } from "../middleware/authMiddleware.js";

const roomRouter = express.Router();

// ✅ CREATE ROOM
roomRouter.post("/", protect, upload.array("images", 4), createRoom);

// ✅ GET ALL ROOMS
roomRouter.get("/", getRooms);

// ✅ GET OWNER ROOMS
roomRouter.get("/owner", protect, getOwnerRooms);

// ✅ GET SINGLE ROOM
roomRouter.get("/:id", getRoomById);

// ✅ TOGGLE AVAILABILITY
roomRouter.post("/toggle-availability", protect, toggleRoomAvailability);

export default roomRouter;
