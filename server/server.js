import express from "express";
import cors from "cors";
import "dotenv/config";
import { clerkMiddleware } from "@clerk/express";
import path from "path";

import connectDB from "./configs/db.js";

import userRouter from "./routes/userRoutes.js";
import hotelRouter from "./routes/hotelRoutes.js";
import roomRouter from "./routes/roomRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";

import clerkWebhooks from "./controllers/clerkWebhooks.js";

connectDB();

const app = express();

app.use(cors());

// ✅ Webhook route FIRST + raw body
app.post(
  "/api/webhooks/clerk",
  express.raw({ type: "application/json" }),
  clerkWebhooks
);

// ✅ Normal parsing AFTER webhook
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(clerkMiddleware());

const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("Anumifly code work (Api working)...");
});

app.use("/api/user", userRouter);
app.use("/api/hotels", hotelRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/bookings", bookingRouter);

// ✅ Fallback
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);