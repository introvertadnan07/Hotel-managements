import User from "../models/User.js";

export const getUserData = async (req, res) => {
  try {
    const { userId } = req.auth();

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      console.log("❌ User not found in DB (Webhook not synced)");

      return res.status(404).json({
        success: false,
        message: "User not found. Please login again.",
      });
    }

    res.json({
      success: true,
      user,
    });

  } catch (error) {
    console.error("getUserData error:", error.message);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const storeRecentSearchCities = async (req, res) => {
  try {
    res.json({
      success: true,
      message: "Recent cities stored (placeholder)",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
