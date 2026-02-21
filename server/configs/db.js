import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI not found in environment variables");
    }

    // ✅ Prevent multiple connections in serverless
    if (mongoose.connection.readyState === 1) {
      console.log("✅ MongoDB already connected");
      return;
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "hotelBooking",   // ⚠️ change if different
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ MongoDB connected successfully");

  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
  }
};

export default connectDB;