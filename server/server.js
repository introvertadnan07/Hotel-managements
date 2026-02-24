import express from "express";
import cors from "cors";
import "dotenv/config";
import { clerkMiddleware } from "@clerk/express";
import path from "path";

import connectDB from "./configs/db.js";
import connectCloudinary from "./configs/cloudinary.js";

import userRouter from "./routes/userRoutes.js";
import hotelRouter from "./routes/hotelRoutes.js";
import roomRouter from "./routes/roomRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import reviewRouter from "./routes/reviewRoutes.js";
import wishlistRouter from "./routes/wishlistRoutes.js";
import aiRouter from "./routes/aiRoutes.js";

import clerkWebhooks from "./controllers/clerkWebhooks.js";
import { stripeWebhooks } from "./controllers/stripeWebhooks.js";

// ✅ Initialize services
connectCloudinary();
connectDB();

const app = express();

//
// ✅ SMART CORS FIX (Handles localhost + Vercel + Preview)
//
app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin || // allow Postman / curl / mobile apps
        origin.includes("localhost") ||
        origin.includes("vercel.app")
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

//
// ✅ Stripe Webhook (RAW body required)
//
app.post(
  "/api/webhooks/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhooks
);

//
// ✅ Clerk Webhook (RAW body required)
//
app.post(
  "/api/webhooks/clerk",
  express.raw({ type: "application/json" }),
  clerkWebhooks
);

//
// ✅ Body parsers (AFTER webhooks)
//
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//
// ✅ Clerk Middleware
//
app.use(clerkMiddleware());

//
// ✅ Static Uploads Folder
//
const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//
// ✅ Health Routes
//
app.get("/", (req, res) => {
  res.send("✅ Anumifly API working...");
});

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

//
// ✅ API Routes
//
app.use("/api/user", userRouter);
app.use("/api/hotels", hotelRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/ai", aiRouter);

//
// ✅ 404 Fallback
//
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

//
// ✅ Start Server
//
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});