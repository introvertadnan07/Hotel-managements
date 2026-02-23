import express from "express";
import {
  getReviewSummary,
  getRecommendations,
  chatAssistant,
} from "../controllers/aiController.js";

const aiRouter = express.Router();

aiRouter.get("/review-summary/:roomId", getReviewSummary);
aiRouter.get("/recommendations/:roomId", getRecommendations);

// ⭐ AI CHAT ASSISTANT
aiRouter.post("/chat", chatAssistant);

export default aiRouter;