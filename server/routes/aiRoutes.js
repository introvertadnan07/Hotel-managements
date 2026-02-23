import express from "express";
import {
  getReviewSummary,
  getRecommendations,
  chatAssistant,
  getPriceSuggestion,
  getSentimentAnalysis,
} from "../controllers/aiController.js";

const aiRouter = express.Router();

aiRouter.get("/review-summary/:roomId", getReviewSummary);
aiRouter.get("/recommendations/:roomId", getRecommendations);
aiRouter.get("/price-suggestion/:roomId", getPriceSuggestion);
aiRouter.get("/sentiment/:roomId", getSentimentAnalysis);

aiRouter.post("/chat", chatAssistant);

export default aiRouter;