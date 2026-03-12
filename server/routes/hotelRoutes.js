import express from "express";
import { registerHotel, getOwnerHotels } from "../controllers/hotelController.js";
import { protect } from "../middleware/authMiddleware.js";

const hotelRouter = express.Router();

hotelRouter.get("/owner", protect, getOwnerHotels); 
hotelRouter.post("/", protect, registerHotel);

export default hotelRouter;