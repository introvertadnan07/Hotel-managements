import User from "../models/User.js";

export const getUserData = async (req, res) => {
  try {
    const { userId } = req.auth(); // ✅ Clerk auth

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    let user = await User.findOne({ clerkId: userId });

    // ✅ Create user if not exists
    if (!user) {
      user = await User.create({
        clerkId: userId,
        role: "user",
      });
    }

    res.json({
      success: true,
      user: {
        role: user.role,
      },
    });

  } catch (error) {
    console.error("getUserData error:", error);

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
      message: "Feature coming soon",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
