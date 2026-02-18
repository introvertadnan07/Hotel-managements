import express from "express";
import {
  getUserData,
  storeRecentSearchCities,
} from "../controllers/userController.js";

import { requireAuth } from "@clerk/express"; // ✅ IMPORTANT

const userRouter = express.Router();

// ✅ Protect routes with Clerk auth
userRouter.get("/", requireAuth(), getUserData);
userRouter.post("/store-recent-search", requireAuth(), storeRecentSearchCities);

export default userRouter;
