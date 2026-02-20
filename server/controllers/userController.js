import User from "../models/User.js";

export const getUserData = async (req, res) => {
  try {
    const { userId, sessionClaims } = req.auth();

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    let user = await User.findOne({ clerkId: userId });

    // ✅ Fallback create user
    if (!user) {
      console.log("⚠️ User missing in DB → creating fallback user");

      user = await User.create({
        clerkId: userId,
        email: sessionClaims?.email || "no-email",
        username: sessionClaims?.name || "User",
        image: sessionClaims?.image || "",
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

// ✅ ADD THIS (missing export)
export const storeRecentSearchCities = async (req, res) => {
  try {
    res.json({
      success: true,
      message: "Recent cities stored",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};