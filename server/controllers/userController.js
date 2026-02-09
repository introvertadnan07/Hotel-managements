import User from "../models/User.js";

export const getUserData = async (req, res) => {
  try {
    if (!req.auth?.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    let user = await User.findOne({ clerkId: req.auth.userId });

    // If first-time login, create user
    if (!user) {
      user = await User.create({
        clerkId: req.auth.userId,
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
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const storeRecentSearchCities = async (req, res) => {
  res.json({
    success: true,
    message: "Feature coming soon",
  });
};
