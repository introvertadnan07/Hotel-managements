import Hotel from "../models/Hotel.js";
import User from "../models/User.js";

// ✅ REGISTER HOTEL — allows multiple hotels per owner
export const registerHotel = async (req, res) => {
  try {
    if (!req.user || !req.user.clerkId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    let { name, address, city, contact } = req.body;

    name    = name?.trim();
    address = address?.trim();
    city    = city?.trim();
    contact = contact?.trim();

    if (!name || !address || !city || !contact) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const userExists = await User.findOne({ clerkId: req.user.clerkId });
    if (!userExists) {
      return res.status(404).json({ success: false, message: "User not found. Please login again." });
    }

    // ✅ REMOVED: duplicate hotel check — now allows multiple hotels per owner

    const hotel = await Hotel.create({
      name,
      address,
      city,
      contact,
      owner: req.user.clerkId,
    });

    // ✅ Update user role → hotelOwner (only if not already)
    if (userExists.role !== "hotelOwner") {
      userExists.role = "hotelOwner";
      await userExists.save();
    }

    res.json({ success: true, message: "Hotel registered successfully", hotel });

  } catch (error) {
    console.error("Register hotel error:", error.message);
    res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

// ✅ GET ALL HOTELS owned by logged-in user
export const getOwnerHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find({ owner: req.user.clerkId });
    res.json({ success: true, hotels });
  } catch (error) {
    console.error("Get owner hotels error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};