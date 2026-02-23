import OpenAI from "openai";
import Review from "../models/Review.js";
import Room from "../models/Room.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
            "Summarize hotel room reviews in a short, friendly paragraph. Mention positives and any common complaints if present.",
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