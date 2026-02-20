import User from "../models/User.js";
import clerkClient from "@clerk/clerk-sdk-node"; // if not already

export const protect = async (req, res, next) => {
  try {
    const auth = req.auth();

    if (!auth?.userId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    let user = await User.findOne({ clerkId: auth.userId });

    // ✅ AUTO-SYNC if missing
    if (!user) {
      console.log("⚠️ User not in DB → syncing from Clerk");

      const clerkUser = await clerkClient.users.getUser(auth.userId);

      const email = clerkUser.emailAddresses?.[0]?.emailAddress;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "User email not available",
        });
      }

      user = await User.create({
        clerkId: clerkUser.id,
        email,
        username:
          `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim(),
        image: clerkUser.imageUrl,
      });

      console.log("✅ User synced to DB");
    }

    req.user = user;
    next();

  } catch (error) {
    console.error("Auth error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};