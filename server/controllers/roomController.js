import Room from "../models/Room.js";
import Hotel from "../models/Hotel.js";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

// ✅ CREATE ROOM — accepts hotelId from frontend
export const createRoom = async (req, res) => {
  try {
    const {
      hotelId, roomType, pricePerNight, amenities,
      maxGuests, baseGuests, extraGuestPrice,
      beds, bathrooms, description, category,
    } = req.body;

    if (!roomType || !pricePerNight) {
      return res.status(400).json({ success: false, message: "Room type and price are required" });
    }

    // ✅ If hotelId provided, verify ownership. Otherwise fallback to first hotel.
    let hotel;
    if (hotelId) {
      hotel = await Hotel.findOne({ _id: hotelId, owner: req.user.clerkId });
      if (!hotel) return res.status(403).json({ success: false, message: "Hotel not found or unauthorized" });
    } else {
      hotel = await Hotel.findOne({ owner: req.user.clerkId });
    }

    if (!hotel) {
      return res.status(400).json({ success: false, message: "No hotel found. Please register a hotel first." });
    }

    // ✅ Upload images to Cloudinary
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadFromBuffer = (fileBuffer) =>
          new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: "rooms" },
              (error, result) => { if (error) reject(error); else resolve(result); }
            );
            streamifier.createReadStream(fileBuffer).pipe(stream);
          });
        const result = await uploadFromBuffer(file.buffer);
        imageUrls.push(result.secure_url);
      }
    }

    const room = await Room.create({
      hotel: hotel._id,
      roomType,
      pricePerNight: Number(pricePerNight),
      amenities: amenities ? JSON.parse(amenities) : [],
      images: imageUrls,
      maxGuests: maxGuests ? Number(maxGuests) : 4,
      baseGuests: baseGuests ? Number(baseGuests) : 2,
      extraGuestPrice: extraGuestPrice ? Number(extraGuestPrice) : 500,
      beds: beds ? Number(beds) : 1,
      bathrooms: bathrooms ? Number(bathrooms) : 1,
      description: description || "",
      category: category || "Standard",
    });

    res.json({ success: true, message: "Room created successfully", room });
  } catch (error) {
    console.error("Create room error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ GET ALL ROOMS
export const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ isAvailable: true }).populate("hotel");
    res.json({ success: true, rooms });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ GET SINGLE ROOM
export const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate("hotel");
    if (!room) return res.status(404).json({ success: false, message: "Room not found" });
    res.json({ success: true, room });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ GET OWNER ROOMS — across ALL hotels of this owner
export const getOwnerRooms = async (req, res) => {
  try {
    const hotels = await Hotel.find({ owner: req.user.clerkId });
    if (!hotels.length) return res.json({ success: true, rooms: [] });
    const hotelIds = hotels.map(h => h._id);
    const rooms = await Room.find({ hotel: { $in: hotelIds } }).populate("hotel");
    res.json({ success: true, rooms });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ TOGGLE AVAILABILITY
export const toggleRoomAvailability = async (req, res) => {
  try {
    const { roomId } = req.body;
    const room = await Room.findById(roomId);
    if (!room) return res.json({ success: false, message: "Room not found" });
    room.isAvailable = !room.isAvailable;
    await room.save();
    res.json({ success: true, message: `Room marked as ${room.isAvailable ? "Available" : "Unavailable"}` });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};