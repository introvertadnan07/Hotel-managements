import express from "express";
import {
  addReview,
  getRoomReviews,
  canReviewRoom,
  replyToReview,
  deleteReply,
} from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const reviewRouter = express.Router();

reviewRouter.post("/", protect, addReview);
reviewRouter.get("/can-review/:roomId", protect, canReviewRoom);
reviewRouter.get("/:roomId", getRoomReviews);
reviewRouter.post("/:reviewId/reply", protect, replyToReview);  
reviewRouter.delete("/:reviewId/reply", protect, deleteReply);  

export default reviewRouter;