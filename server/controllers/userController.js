import User from "../models/User.js";

export const getUserData = async (req, res) => {
  try {
    const auth = req.auth();

    if (!auth || !auth.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    let user = await User.findOne({ clerkId: auth.userId });

    if (!user) {
      user = await User.create({
        clerkId: auth.userId,
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
