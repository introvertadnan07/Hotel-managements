import express from "express";
import {
  getReviewSummary,
  getRecommendations,
  chatAssistant,
  generateRoomDescription,
} from "../controllers/aiController.js";

const aiRouter = express.Router();

aiRouter.get("/review-summary/:roomId", getReviewSummary);
aiRouter.get("/recommendations/:roomId", getRecommendations);
aiRouter.post("/chat", chatAssistant);

// ⭐ NEW ROUTE
aiRouter.get("/generate-description/:roomId", generateRoomDescription);

export default aiRouter;