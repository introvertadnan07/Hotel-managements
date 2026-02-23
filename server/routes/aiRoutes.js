import express from "express";
import {
  getReviewSummary,
  getRecommendations,
  chatAssistant,
  generateRoomDescription,
  getPriceSuggestion, // ✅ NEW
} from "../controllers/aiController.js";

const aiRouter = express.Router();

aiRouter.get("/review-summary/:roomId", getReviewSummary);
aiRouter.get("/recommendations/:roomId", getRecommendations);
aiRouter.post("/chat", chatAssistant);


aiRouter.get("/generate-description/:roomId", generateRoomDescription);

aiRouter.get("/price-suggestion/:roomId", getPriceSuggestion);

export default aiRouter;