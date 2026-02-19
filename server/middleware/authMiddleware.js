import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const auth = req.auth();

    if (!auth?.userId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const user = await User.findOne({ clerkId: auth.userId });

    if (!user) {
      console.log("❌ User not found in DB for clerkId:", auth.userId);

      return res.status(404).json({
        success: false,
        message: "User not found. Please login again.",
      });
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
