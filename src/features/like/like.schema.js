import mongoose from "mongoose";

export const likeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likeable: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "on_model",
    },
    on_model: {
      type: String,
      required: true,
      enum: ["Product", "Category"],
    },
  },
  { timestamps: true }
);

likeSchema.index({ user: 1, likeable: 1, on_model: 1 }, { unique: true });
