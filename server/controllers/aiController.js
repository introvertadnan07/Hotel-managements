import OpenAI from "openai";
import Review from "../models/Review.js";
import Room from "../models/Room.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ⭐ AI REVIEW SUMMARY
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
      .map(r => `Rating: ${r.rating}, Comment: ${r.comment}`)
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

// ⭐ SMART RECOMMENDATIONS
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
    }).limit(4);

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

// ⭐ AI CHAT ASSISTANT
export const chatAssistant = async (req, res) => {
  try {
    const { message } = req.body;

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

// ⭐ NEW → AI DESCRIPTION GENERATOR
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