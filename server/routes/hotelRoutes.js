import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { registerHotel } from "../controllers/hotelController.js";

const hotelRouter = express.Router();

// Register hotel (OWNER)
hotelRouter.post("/", protect, registerHotel);

export default hotelRouter;
