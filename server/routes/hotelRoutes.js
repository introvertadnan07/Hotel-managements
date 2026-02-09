import express from "express";
import { registerHotel } from "../controllers/hotelController.js";

const hotelRouter = express.Router();

hotelRouter.post("/", registerHotel);

export default hotelRouter;
