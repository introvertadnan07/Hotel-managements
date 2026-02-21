import Hotel from "../models/Hotel.js";
import User from "../models/User.js";

export const registerHotel = async (req, res) => {
  try {
    // ✅ Ensure authenticated user exists
    if (!req.user || !req.user.clerkId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    let { name, address, city, contact } = req.body;

    // ✅ Trim inputs
    name = name?.trim();
    address = address?.trim();
    city = city?.trim();
    contact = contact?.trim();

    // ✅ Validate fields
    if (!name || !address || !city || !contact) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // ✅ Check user exists
    const userExists = await User.findOne({ clerkId: req.user.clerkId });

    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please login again.",
      });
    }

    // ✅ Prevent duplicate hotel per owner
    const existingHotel = await Hotel.findOne({
      owner: req.user.clerkId,
    });

    if (existingHotel) {
      return res.status(400).json({
        success: false,
        message: "You already registered a hotel",
      });
    }

    // ✅ Create hotel
    const hotel = await Hotel.create({
      name,
      address,
      city,
      contact,
      owner: req.user.clerkId,
    });

    // ✅ Update user role → hotelOwner
    userExists.role = "hotelOwner";
    await userExists.save();

    res.json({
      success: true,
      message: "Hotel registered successfully",
      hotel,
    });

  } catch (error) {
    console.error("Register hotel error:", error.message);

    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};