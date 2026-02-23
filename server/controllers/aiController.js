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
        { role: "user", content: reviewText },
      ],
    });

    res.json({
      success: true,
      summary: completion.choices[0].message.content,
    });

  } catch (error) {
    console.error("AI Summary Error:", error.message);
    res.status(500).json({ success: false, message: "Summary failed" });
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
    }).limit(4).populate("hotel");

    res.json({ success: true, rooms });

  } catch (error) {
    console.error("Recommendation Error:", error.message);
    res.status(500).json({ success: false, message: "Recommendation failed" });
  }
};

// ⭐ AI CHAT ASSISTANT
export const chatAssistant = async (req, res) => {
  try {
    const { message } = req.body;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: message }],
    });

    res.json({
      success: true,
      reply: completion.choices[0].message.content,
    });

  } catch (error) {
    console.error("AI Chat Error:", error.message);
    res.status(500).json({ success: false, message: "Chat failed" });
  }
};

// ⭐ AI PRICE SUGGESTION
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
Suggest a competitive price.

Room Type: ${room.roomType}
Current Price: ₹${room.pricePerNight}
Amenities: ${room.amenities.join(", ")}
City: ${room.hotel?.city}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: prompt }],
    });

    res.json({
      success: true,
      suggestion: completion.choices[0].message.content,
    });

  } catch (error) {
    console.error("Pricing Error:", error.message);
    res.status(500).json({ success: false, message: "Pricing failed" });
  }
};

// ⭐ AI SENTIMENT ANALYSIS
export const getSentimentAnalysis = async (req, res) => {
  try {
    const { roomId } = req.params;

    const reviews = await Review.find({ room: roomId });

    if (!reviews.length) {
      return res.json({
        success: true,
        analysis: "No reviews available.",
      });
    }

    const reviewText = reviews.map(r => r.comment).join("\n");

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "user",
          content: `Analyze sentiment:\n${reviewText}`,
        },
      ],
    });

    res.json({
      success: true,
      analysis: completion.choices[0].message.content,
    });

  } catch (error) {
    console.error("Sentiment Error:", error.message);
    res.status(500).json({ success: false, message: "Sentiment failed" });
  }
};