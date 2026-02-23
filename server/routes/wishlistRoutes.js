import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  toggleWishlist,
  getUserWishlist,
} from "../controllers/wishlistController.js";

const wishlistRouter = express.Router();

// Toggle save/remove
wishlistRouter.post("/toggle", protect, toggleWishlist);

// Get wishlist
wishlistRouter.get("/", protect, getUserWishlist);

export default wishlistRouter;