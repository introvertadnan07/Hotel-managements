import Hotel from "../models/Hotel.js";
import User from "../models/User.js";   // ✅ IMPORTANT

export const registerHotel = async (req, res) => {
  try {
    const { name, address, city, contact } = req.body;

    if (!name || !address || !city || !contact) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
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

    // ✅ UPDATE USER ROLE
    await User.findOneAndUpdate(
      { clerkId: req.user.clerkId },
      { role: "hotelOwner" }
    );

    res.json({
      success: true,
      message: "Hotel registered successfully",
      hotel,
    });

  } catch (error) {
    console.error("Register hotel error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
