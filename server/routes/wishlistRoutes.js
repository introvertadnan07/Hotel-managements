import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { toggleWishlist, getUserWishlist } from "../controllers/wishlistController.js";

const wishlistRouter = express.Router();

wishlistRouter.post("/toggle", protect, toggleWishlist);
wishlistRouter.get("/", protect, getUserWishlist);

export default wishlistRouter;