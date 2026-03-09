import express from "express";
import Newsletter from "../models/Newsletter.js";

const newsletterRouter = express.Router();

//
// SUBSCRIBE
//
newsletterRouter.post("/subscribe", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes("@")) {
      return res.status(400).json({ success: false, message: "Valid email is required" });
    }

    // Check if already subscribed
    const existing = await Newsletter.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email already subscribed" });
    }

    await Newsletter.create({ email });

    res.json({ success: true, message: "Subscribed successfully!" });

  } catch (error) {
    console.error("Newsletter error:", error);
    res.status(500).json({ success: false, message: "Subscription failed" });
  }
});

export default newsletterRouter;
