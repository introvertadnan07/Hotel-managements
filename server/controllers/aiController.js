import OpenAI from "openai";
import Review from "../models/Review.js";
import Room from "../models/Room.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

//
// ⭐ AI REVIEW SUMMARY
//
export const getReviewSummary = async (req, res) => {
  try {
    const { roomId } = req.params;

    const reviews = await Review.find({ room: roomId }).limit(20);

    if (!reviews.length) {
      return res.json({
        success: true,
        summary: "No reviews yet for this room.",
      });
    }

    const reviewText = reviews
      .map((r) => `Rating: ${r.rating}, Comment: ${r.comment}`)
      .join("\n");

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "Summarize hotel room reviews in a short, friendly paragraph.",
        },
        {
          role: "user",
          content: reviewText,
        },
      ],
    });

    res.json({
      success: true,
      summary: completion.choices[0].message.content,
    });

  } catch (error) {
    console.error("AI Summary Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to generate summary",
    });
  }
};

//
// ⭐ SMART RECOMMENDATIONS
//
export const getRecommendations = async (req, res) => {
  try {
    const { roomId } = req.params;

    const currentRoom = await Room.findById(roomId);

    if (!currentRoom) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    const rooms = await Room.find({
      _id: { $ne: roomId },
      roomType: currentRoom.roomType,
    })
      .limit(4)
      .populate("hotel");

    res.json({
      success: true,
      rooms,
    });

  } catch (error) {
    console.error("Recommendation Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch recommendations",
    });
  }
};

//
// ⭐ AI CHAT ASSISTANT
//
export const chatAssistant = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.json({
        success: false,
        message: "Message required",
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: "You are a smart hotel booking assistant.",
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    res.json({
      success: true,
      reply: completion.choices[0].message.content,
    });

  } catch (error) {
    console.error("AI Chat Error:", error.message);

    res.status(500).json({
      success: false,
      message: "AI assistant failed",
    });
  }
};

//
// ⭐ AI ROOM DESCRIPTION GENERATOR
//
export const generateRoomDescription = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findById(roomId).populate("hotel");

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    const prompt = `
Write a compelling and attractive hotel room description.

Room Type: ${room.roomType}
Price: ₹${room.pricePerNight}
Amenities: ${room.amenities.join(", ")}
Hotel: ${room.hotel?.name}
Location: ${room.hotel?.city}

Keep it short, engaging, and luxurious.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: "You are a hotel marketing expert." },
        { role: "user", content: prompt },
      ],
    });

    res.json({
      success: true,
      description: completion.choices[0].message.content,
    });

  } catch (error) {
    console.error("AI Description Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to generate description",
    });
  }
};

//
// ⭐ AI PRICE SUGGESTION
//
export const getPriceSuggestion = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findById(roomId).populate("hotel");

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    const prompt = `
Suggest an optimal price per night for this hotel room.

Room Type: ${room.roomType}
Current Price: ₹${room.pricePerNight}
Location: ${room.hotel?.city}
Amenities: ${room.amenities.join(", ")}

Give a short recommendation with reasoning.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: "You are a hotel pricing expert." },
        { role: "user", content: prompt },
      ],
    });

    res.json({
      success: true,
      suggestion: completion.choices[0].message.content,
    });

  } catch (error) {
    console.error("AI Pricing Error:", error.message);

    res.status(500).json({
      success: false,
      message: "AI pricing failed",
    });
  }
};

//
// ⭐ NEW → ROOM COMPARISON AI
//
export const compareRoomsAI = async (req, res) => {
  try {
    const { room1, room2 } = req.body;

    if (!room1 || !room2) {
      return res.json({
        success: false,
        message: "Two room IDs required",
      });
    }

    const r1 = await Room.findById(room1).populate("hotel");
    const r2 = await Room.findById(room2).populate("hotel");

    if (!r1 || !r2) {
      return res.json({
        success: false,
        message: "Rooms not found",
      });
    }

    const prompt = `
Compare these two hotel rooms.

ROOM 1:
Type: ${r1.roomType}
Price: ₹${r1.pricePerNight}
Amenities: ${r1.amenities.join(", ")}
Hotel: ${r1.hotel?.name}
City: ${r1.hotel?.city}

ROOM 2:
Type: ${r2.roomType}
Price: ₹${r2.pricePerNight}
Amenities: ${r2.amenities.join(", ")}
Hotel: ${r2.hotel?.name}
City: ${r2.hotel?.city}

Provide a short, clear, and helpful comparison for a user choosing between them.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: "You are a hotel comparison expert." },
        { role: "user", content: prompt },
      ],
    });

    res.json({
      success: true,
      comparison: completion.choices[0].message.content,
    });

  } catch (error) {
    console.error("COMPARE AI ERROR:", error.message);

    res.status(500).json({
      success: false,
      message: "Comparison failed",
    });
  }
};