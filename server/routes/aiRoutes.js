import express from "express";
import { getReviewSummary } from "../controllers/aiController.js";

const aiRouter = express.Router();

aiRouter.get("/review-summary/:roomId", getReviewSummary);

export default aiRouter;