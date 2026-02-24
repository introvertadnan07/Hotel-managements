import express from "express";
import {
  getReviewSummary,
  getRecommendations,
  chatAssistant,
  generateRoomDescription,
  getPriceSuggestion,
  compareRoomsAI, 
} from "../controllers/aiController.js";

const aiRouter = express.Router();

aiRouter.get("/review-summary/:roomId", getReviewSummary);
aiRouter.get("/recommendations/:roomId", getRecommendations);
aiRouter.post("/chat", chatAssistant);
aiRouter.get("/generate-description/:roomId", generateRoomDescription);
aiRouter.get("/price-suggestion/:roomId", getPriceSuggestion);

// ⭐ NEW ROUTE
aiRouter.post("/compare-rooms", compareRoomsAI);

export default aiRouter;