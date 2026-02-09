import Room from "../models/Room.js";

export const createRoom = async (req, res) => {
  try {
    if (!req.auth?.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { hotelId, title, price, capacity } = req.body;

    if (!hotelId || !title || !price || !capacity) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const room = await Room.create({
      hotel: hotelId,
      title,
      price,
      capacity,
    });

    res.json({
      success: true,
      room,
    });
  } catch (error) {
    console.error("Create room error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json({
      success: true,
      rooms,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
