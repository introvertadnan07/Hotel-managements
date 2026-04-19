import express from "express";
import cors from "cors";
import "dotenv/config";
import path from "path";
import { clerkMiddleware } from "@clerk/express";

import connectDB from "./configs/db.js";
import connectCloudinary from "./configs/cloudinary.js";

import userRouter from "./routes/userRoutes.js";
import hotelRouter from "./routes/hotelRoutes.js";
import roomRouter from "./routes/roomRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import reviewRouter from "./routes/reviewRoutes.js";
import wishlistRouter from "./routes/wishlistRoutes.js";
import aiRouter from "./routes/aiRoutes.js";
import newsletterRouter from "./routes/newsletterRoutes.js";
import adminRouter from "./routes/adminRoutes.js";

import clerkWebhooks from "./controllers/clerkWebhooks.js";
import { stripeWebhooks } from "./controllers/stripeWebhooks.js";

//
// ✅ Initialize Services
//
connectCloudinary();
connectDB();

const app = express();

//
// ✅ FIXED CORS (ONLY CHANGE HERE)
//
app.use(
  cors({
    origin: "https://anumifly.vercel.app",
    credentials: true,
  })
);

app.options("*", cors());

//
// ✅ Stripe Webhook (RAW body REQUIRED)
//
app.post(
  "/api/webhooks/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhooks
);

//
// ✅ Clerk Webhook
//
app.post(
  "/api/webhooks/clerk",
  express.raw({ type: "application/json" }),
  clerkWebhooks
);

//
// ✅ Body Parsers
//
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//
// ✅ Clerk Middleware
//
app.use(clerkMiddleware());

//
// ✅ Static Uploads
//
const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//
// ✅ Routes
//
app.use("/api/admin", adminRouter);
app.use("/api/user", userRouter);
app.use("/api/hotels", hotelRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/ai", aiRouter);
app.use("/api/newsletter", newsletterRouter);

//
// ✅ Health check
//
app.get("/", (req, res) => {
  res.send("✅ Anumifly API working...");
});

//
// ✅ 404 fallback
//
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

//
// ✅ Start server
//
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});