import User from "../models/User.js";

// ✅ Admin middleware — only allows users with role "admin"
export const adminOnly = async (req, res, next) => {
  try {
    const user = req.user; // already set by protect middleware

    if (!user || user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admins only.",
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};