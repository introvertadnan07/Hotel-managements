import User from "../models/User.js";

export const getUserData = async (req, res) => {
  try {
    const { userId, sessionClaims } = req.auth();

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    let user = await User.findOne({ clerkId: userId });

    if (!user) {
      console.log("⚠️ User missing in DB → creating fallback user");
      user = await User.create({
        clerkId:  userId,
        email:    sessionClaims?.email || "no-email",
        username: sessionClaims?.name  || "User",
        image:    sessionClaims?.image || "",
      });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error("getUserData error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const storeRecentSearchCities = async (req, res) => {
  try {
    res.json({ success: true, message: "Recent cities stored" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ NEW — Update user profile (name + phone)
export const updateProfile = async (req, res) => {
  try {
    const { username, phone } = req.body;

    if (!username || username.trim().length < 2) {
      return res.status(400).json({ success: false, message: "Name must be at least 2 characters" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { username: username.trim(), phone: phone?.trim() || "" },
      { new: true }
    );

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, user, message: "Profile updated successfully" });
  } catch (error) {
    console.error("updateProfile error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};