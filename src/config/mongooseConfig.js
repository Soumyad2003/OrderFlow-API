import mongoose from "mongoose";

export const connectUsingMongoose = async () => {
  const url = process.env.DB_URL;
  if (!url) {
    throw new Error("DB_URL environment variable is not defined");
  }

  try {
    await mongoose.connect(url, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("MongoDB connected successfully via Mongoose");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    throw err;
  }
};
