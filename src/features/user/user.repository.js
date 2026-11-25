import mongoose from "mongoose";
import { userSchema } from "./user.schema.js";
import { ApplicationError } from "../../error-handler/applicationError.js";

const User = mongoose.model("User", userSchema);

export default class UserRepository {
  async signUp(userData) {
    try {
      const newUser = new User(userData);
      await newUser.save();
      return newUser;
    } catch (err) {
      if (err instanceof mongoose.Error.ValidationError) {
        throw err;
      }
      if (err.code === 11000) {
        throw new ApplicationError("Email already registered", 409);
      }
      throw new ApplicationError("Database error during sign up", 500);
    }
  }

  async findByEmail(email) {
    try {
      return await User.findOne({ email });
    } catch (err) {
      throw new ApplicationError("Database error", 500);
    }
  }

  async findById(id) {
    try {
      return await User.findById(id).select("-password");
    } catch (err) {
      throw new ApplicationError("Database error", 500);
    }
  }

  async resetPassword(userID, hashedPassword) {
    try {
      const user = await User.findById(userID);
      if (!user) {
        throw new ApplicationError("User not found", 404);
      }
      user.password = hashedPassword;
      await user.save();
      return user;
    } catch (err) {
      if (err instanceof ApplicationError) throw err;
      throw new ApplicationError("Database error during password reset", 500);
    }
  }
}
