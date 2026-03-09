import express from "express";
import { addReview, getRoomReviews, canReviewRoom } from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const reviewRouter = express.Router();

reviewRouter.post("/", protect, addReview);
reviewRouter.get("/:roomId", getRoomReviews);
reviewRouter.get("/can-review/:roomId", protect, canReviewRoom); 

export default reviewRouter;