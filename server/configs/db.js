import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () =>
      console.log("✅ Database connected")
    );

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1); // optional but recommended
  }
};

export default connectDB;