import Hotel from "../models/Hotel.js";
import User from "../models/User.js";

export const registerHotel = async (req, res) => {
  try {
    if (!req.user) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    const { name, address, contact, city } = req.body;
    const owner = req.user._id;

    // Check if hotel already registered by this owner
    const hotel = await Hotel.findOne({ owner });
    if (hotel) {
      return res.json({
        success: false,
        message: "Hotel already registered",
      });
    }

    // Create hotel
    await Hotel.create({
      name,
      address,
      contact,
      city,
      owner,
    });

    // Update user role
    await User.findByIdAndUpdate(owner, { role: "hotelOwner" });

    res.json({
      success: true,
      message: "Hotel registered successfully",
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};
