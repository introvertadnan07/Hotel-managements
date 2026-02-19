import express from "express";
import {
  getUserData,
  storeRecentSearchCities,
} from "../controllers/userController.js";

import { requireAuth } from "@clerk/express";

const userRouter = express.Router();

userRouter.get("/", requireAuth(), getUserData);
userRouter.post(
  "/store-recent-search",
  requireAuth(),
  storeRecentSearchCities
);

export default userRouter;
