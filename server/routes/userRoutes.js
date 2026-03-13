import express from "express";
import {
  getUserData,
  storeRecentSearchCities,
  updateProfile,
} from "../controllers/userController.js";
import { requireAuth } from "@clerk/express";
import { protect } from "../middleware/authMiddleware.js";

const userRouter = express.Router();

userRouter.get("/", requireAuth(), getUserData);
userRouter.post("/store-recent-search", requireAuth(), storeRecentSearchCities);
userRouter.put("/profile", protect, updateProfile); 

export default userRouter;