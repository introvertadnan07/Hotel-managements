import Room from "../models/Room.js";
import Hotel from "../models/Hotel.js";


// ✅ CREATE ROOM
export const createRoom = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({ owner: req.user.clerkId });

    if (!hotel) {
      return res.status(400).json({
        success: false,
        message: "No hotel found for this owner",
      });
    }

    const { roomType, pricePerNight, amenities } = req.body;

    if (!roomType || !pricePerNight) {
      return res.status(400).json({
        success: false,
        message: "Room type and price are required",
      });
    }

    const imagePaths =
      req.files?.map((file) => `/uploads/${file.filename}`) || [];

    const room = await Room.create({
      hotel: hotel._id,
      roomType,
      pricePerNight: Number(pricePerNight),
      amenities: amenities ? JSON.parse(amenities) : [],
      images: imagePaths,
    });

    res.json({
      success: true,
      message: "Room created successfully",
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


// ✅ GET ALL ROOMS
export const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find().populate("hotel");

    res.json({
      success: true,
      rooms,
    });

  } catch (error) {
    console.error("Get rooms error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ✅ GET SINGLE ROOM
export const getRoomById = async (req, res) => {
  try {
    const { id } = req.params;

    const room = await Room.findById(id).populate("hotel");

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    res.json({
      success: true,
      room,
    });

  } catch (error) {
    console.error("Get room by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ✅ GET OWNER ROOMS
export const getOwnerRooms = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({ owner: req.user.clerkId });

    if (!hotel) {
      return res.json({
        success: true,
        rooms: [],
      });
    }

    const rooms = await Room.find({ hotel: hotel._id });

    res.json({
      success: true,
      rooms,
    });

  } catch (error) {
    console.error("Owner rooms error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ✅ TOGGLE AVAILABILITY
export const toggleRoomAvailability = async (req, res) => {
  try {
    const { roomId } = req.body;

    const room = await Room.findById(roomId);

    if (!room) {
      return res.json({
        success: false,
        message: "Room not found",
      });
    }

    room.isAvailable = !room.isAvailable;
    await room.save();

    res.json({
      success: true,
      message: `Room marked as ${
        room.isAvailable ? "Available" : "Unavailable"
      }`,
    });

  } catch (error) {
    console.error("Toggle availability error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
