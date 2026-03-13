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
      return res.json({ success: true, summary: "No reviews yet for this room." });
    }

    const reviewText = reviews
      .map((r) => `Rating: ${r.rating}, Comment: ${r.comment}`)
      .join("\n");

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: "Summarize hotel room reviews in a short, friendly paragraph." },
        { role: "user", content: reviewText },
      ],
    });

    res.json({ success: true, summary: completion.choices[0].message.content });
  } catch (error) {
    console.error("AI Summary Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to generate summary" });
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
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    const rooms = await Room.find({
      _id: { $ne: roomId },
      roomType: currentRoom.roomType,
    }).limit(4).populate("hotel");

    res.json({ success: true, rooms });
  } catch (error) {
    console.error("Recommendation Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch recommendations" });
  }
};

//
// ⭐ AI CHAT ASSISTANT
//
export const chatAssistant = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.json({ success: false, message: "Message required" });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: `You are a smart hotel booking assistant for AnumiflyStay, a premium hotel booking platform in India.
Help guests find rooms, answer questions about bookings, amenities, pricing, and policies.
Be friendly, concise, and helpful. If asked about specific rooms, suggest they use the AI Room Recommender feature.`,
        },
        ...history,
        { role: "user", content: message },
      ],
    });

    res.json({ success: true, reply: completion.choices[0].message.content });
  } catch (error) {
    console.error("AI Chat Error:", error.message);
    res.status(500).json({ success: false, message: "AI assistant failed" });
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
      return res.status(404).json({ success: false, message: "Room not found" });
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

    res.json({ success: true, description: completion.choices[0].message.content });
  } catch (error) {
    console.error("AI Description Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to generate description" });
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
      return res.status(404).json({ success: false, message: "Room not found" });
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

    res.json({ success: true, suggestion: completion.choices[0].message.content });
  } catch (error) {
    console.error("AI Pricing Error:", error.message);
    res.status(500).json({ success: false, message: "AI pricing failed" });
  }
};

//
// ⭐ AI ROOM COMPARISON
//
export const compareRoomsAI = async (req, res) => {
  try {
    const { room1, room2 } = req.body;

    if (!room1 || !room2) {
      return res.json({ success: false, message: "Two room IDs required" });
    }

    const r1 = await Room.findById(room1).populate("hotel");
    const r2 = await Room.findById(room2).populate("hotel");

    if (!r1 || !r2) {
      return res.json({ success: false, message: "Rooms not found" });
    }

    const prompt = `
Compare these two hotel rooms.
ROOM 1:
Type: ${r1.roomType}, Price: ₹${r1.pricePerNight}, Amenities: ${r1.amenities.join(", ")}, Hotel: ${r1.hotel?.name}, City: ${r1.hotel?.city}
ROOM 2:
Type: ${r2.roomType}, Price: ₹${r2.pricePerNight}, Amenities: ${r2.amenities.join(", ")}, Hotel: ${r2.hotel?.name}, City: ${r2.hotel?.city}
Provide a short, clear, and helpful comparison for a user choosing between them.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: "You are a hotel comparison expert." },
        { role: "user", content: prompt },
      ],
    });

    res.json({ success: true, comparison: completion.choices[0].message.content });
  } catch (error) {
    console.error("COMPARE AI ERROR:", error.message);
    res.status(500).json({ success: false, message: "Comparison failed" });
  }
};

//
// ⭐ NEW → AI ROOM RECOMMENDER
// Guest types natural language preferences → AI matches against real rooms in DB
//
export const getAIRoomRecommendations = async (req, res) => {
  try {
    const { preferences } = req.body;

    if (!preferences) {
      return res.status(400).json({ success: false, message: "Preferences required" });
    }

    // Fetch all available rooms from DB
    const allRooms = await Room.find({ isAvailable: true }).populate("hotel").limit(50);

    if (!allRooms.length) {
      return res.json({ success: true, rooms: [], message: "No rooms available right now." });
    }

    // Build room list for AI context
    const roomList = allRooms.map((r, i) => `
Room ${i + 1}:
  ID: ${r._id}
  Type: ${r.roomType}
  Price: ₹${r.pricePerNight}/night
  Hotel: ${r.hotel?.name || "Unknown"}
  City: ${r.hotel?.city || "Unknown"}
  Max Guests: ${r.maxGuests || 2}
  Amenities: ${r.amenities?.join(", ") || "None"}
`).join("\n");

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert hotel room recommender for AnumiflyStay.
You will be given a list of available rooms and a guest's preferences.
Your job is to select the TOP 3 best matching rooms and explain why each one fits.
Always respond ONLY in this exact JSON format and nothing else:
{
  "recommendations": [
    {
      "roomId": "<exact room _id>",
      "reason": "<short 1-2 sentence reason why this room fits>"
    }
  ],
  "message": "<friendly 1 sentence overall response to the guest>"
}`,
        },
        {
          role: "user",
          content: `Guest preferences: "${preferences}"\n\nAvailable rooms:\n${roomList}`,
        },
      ],
    });

    // Parse AI response
    let parsed;
    try {
      const raw = completion.choices[0].message.content;
      const clean = raw.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(clean);
    } catch {
      return res.status(500).json({ success: false, message: "AI response parsing failed" });
    }

    // Enrich with full room data
    const enriched = parsed.recommendations
      .map((rec) => {
        const room = allRooms.find((r) => r._id.toString() === rec.roomId);
        if (!room) return null;
        return { room, reason: rec.reason };
      })
      .filter(Boolean);

    res.json({
      success: true,
      recommendations: enriched,
      message: parsed.message,
    });
  } catch (error) {
    console.error("AI Recommender Error:", error.message);
    res.status(500).json({ success: false, message: "AI recommender failed" });
  }
};