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
            "Summarize hotel room reviews in a short, friendly paragraph. Mention positives and common complaints if any.",
        },
        {
          role: "user",
          content: reviewText,
        },
      ],
    });

    const summary = completion.choices[0].message.content;

    res.json({
      success: true,
      summary,
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
      pricePerNight: {
        $gte: currentRoom.pricePerNight * 0.7,
        $lte: currentRoom.pricePerNight * 1.3,
      },
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

// ⭐ AI CHAT ASSISTANT
export const chatAssistant = async (req, res) => {
  try {
    const { message } = req.body;

    const rooms = await Room.find()
      .populate("hotel")
      .limit(5);

    const roomContext = rooms.map(room => ({
      name: room.roomType,
      price: room.pricePerNight,
      hotel: room.hotel?.name,
    }));

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: `
You are a smart hotel booking assistant.

Available rooms:
${JSON.stringify(roomContext, null, 2)}

Answer user questions naturally and helpfully.
          `,
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