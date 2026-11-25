import mongoose from "mongoose";
import { cartSchema } from "./cart.schema.js";
import { ApplicationError } from "../../error-handler/applicationError.js";

const Cart = mongoose.model("Cart", cartSchema);

export default class CartItemsRepository {
  async add(productID, userID, quantity) {
    try {
      const existingItem = await Cart.findOne({ productID, userID });
      if (existingItem) {
        existingItem.quantity += quantity;
        await existingItem.save();
        return existingItem;
      }
      const cartItem = new Cart({ productID, userID, quantity });
      await cartItem.save();
      return cartItem;
    } catch (err) {
      if (err instanceof mongoose.Error.ValidationError) throw err;
      throw new ApplicationError("Database error while updating cart", 500);
    }
  }

  async get(userID) {
    try {
      return await Cart.find({ userID }).populate("productID", "name price imageUrl");
    } catch (err) {
      throw new ApplicationError("Database error while fetching cart", 500);
    }
  }

  async updateQuantity(cartItemID, userID, quantity) {
    try {
      const item = await Cart.findOneAndUpdate(
        { _id: cartItemID, userID },
        { quantity },
        { new: true, runValidators: true }
      );
      return item;
    } catch (err) {
      throw new ApplicationError("Database error while updating cart item", 500);
    }
  }

  async delete(cartItemID, userID) {
    try {
      const result = await Cart.findOneAndDelete({ _id: cartItemID, userID });
      return result;
    } catch (err) {
      throw new ApplicationError("Database error while removing cart item", 500);
    }
  }

  async clearCart(userID) {
    try {
      await Cart.deleteMany({ userID });
    } catch (err) {
      throw new ApplicationError("Database error while clearing cart", 500);
    }
  }

  async getCartTotal(userID) {
    try {
      const items = await Cart.find({ userID }).populate("productID", "price");
      const total = items.reduce((sum, item) => {
        return sum + (item.productID?.price || 0) * item.quantity;
      }, 0);
      return { items, total };
    } catch (err) {
      throw new ApplicationError("Database error", 500);
    }
  }
}
