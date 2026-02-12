import Hotel from "../models/Hotel.js";
import User from "../models/User.js";

export const registerHotel = async (req, res) => {
  try {
    const auth = req.auth();

    if (!auth || !auth.userId) {
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
      owner: auth.userId,
    });

    // update user role
    await User.findOneAndUpdate(
      { clerkId: auth.userId },
      { role: "hotelOwner" }
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
