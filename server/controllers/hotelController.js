import Hotel from "../models/Hotel.js";
import User from "../models/User.js";

export const registerHotel = async (req, res) => {
  try {
    if (!req.auth?.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { name, address, city, contact } = req.body;

    const hotel = await Hotel.create({
      name,
      address,
      city,
      contact,
      owner: req.auth.userId,
    });

    // 🔥 UPDATE ROLE AFTER HOTEL REGISTER
    await User.findOneAndUpdate(
      { clerkId: req.auth.userId },
      { role: "hotelOwner" },
      { new: true }
    );

    res.json({
      success: true,
      message: "Hotel registered successfully",
      hotel,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
