import express from "express";
import {
  getReviewSummary,
  getRecommendations,
} from "../controllers/aiController.js";

const aiRouter = express.Router();

aiRouter.get("/review-summary/:roomId", getReviewSummary);
aiRouter.get("/recommendations/:roomId", getRecommendations);

export default aiRouter;