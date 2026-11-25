import mongoose from "mongoose";
import { likeSchema } from "./like.schema.js";
import { ApplicationError } from "../../error-handler/applicationError.js";

const Like = mongoose.model("Like", likeSchema);

export class LikeRepository {
  async toggleLike(userID, likeableID, type) {
    try {
      const existingLike = await Like.findOne({
        user: userID,
        likeable: likeableID,
        on_model: type,
      });

      if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);
        return { liked: false, message: "Unliked successfully" };
      }

      const newLike = new Like({
        user: userID,
        likeable: likeableID,
        on_model: type,
      });
      await newLike.save();
      return { liked: true, message: "Liked successfully" };
    } catch (err) {
      if (err.code === 11000) {
        throw new ApplicationError("Already liked", 409);
      }
      throw new ApplicationError("Database error", 500);
    }
  }

  async getLikes(type, id) {
    try {
      return await Like.find({
        likeable: id,
        on_model: type,
      }).populate("user", "name email");
    } catch (err) {
      throw new ApplicationError("Database error while fetching likes", 500);
    }
  }

  async unlikeItem(likeID, userID) {
    try {
      const result = await Like.findOneAndDelete({ _id: likeID, user: userID });
      return result;
    } catch (err) {
      throw new ApplicationError("Database error", 500);
    }
  }
}
