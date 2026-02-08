import express from "express";
import {
  getUserData,
  storeRecentSearchCities,
} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.get("/", getUserData);
userRouter.post("/store-recent-search", storeRecentSearchCities);

export default userRouter;
