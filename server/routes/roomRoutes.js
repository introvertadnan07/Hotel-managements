import express from "express";
import { createRoom, getRooms } from "../controllers/roomController.js";

const roomRouter = express.Router();

roomRouter.post("/", createRoom);
roomRouter.get("/", getRooms);

export default roomRouter;
