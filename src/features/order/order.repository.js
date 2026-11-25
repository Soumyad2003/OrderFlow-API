import mongoose from "mongoose";
import { orderSchema } from "./order.schema.js";
import { ApplicationError } from "../../error-handler/applicationError.js";

const Order = mongoose.model("Order", orderSchema);

// Cart model is registered by cart.repository.js (loaded first via cart routes)
const getCartModel = () => mongoose.model("Cart");

export default class OrderRepository {
  async placeOrder(userID) {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      const order = await this._executeOrderPlacement(userID, session);
      await session.commitTransaction();
      return order;
    } catch (err) {
      await session.abortTransaction().catch(() => {});

      // Standalone MongoDB instances don't support transactions (code 20 / IllegalOperation)
      const isNoReplicaSet =
        err.code === 20 ||
        err.codeName === "IllegalOperation" ||
        /Transaction numbers are only allowed on a replica set/i.test(err.message);

      if (isNoReplicaSet) {
        return await this._executeOrderPlacement(userID, null);
      }

      if (err instanceof ApplicationError) throw err;
      throw new ApplicationError("Error placing order", 500);
    } finally {
      session.endSession();
    }
  }

  async _executeOrderPlacement(userID, session) {
    const Cart = getCartModel();
    const cartQuery = Cart.find({ userID }).populate("productID", "price name");
    if (session) cartQuery.session(session);
    const cartItems = await cartQuery;

    if (!cartItems || cartItems.length === 0) {
      throw new ApplicationError("Cart is empty", 400);
    }

    const orderItems = cartItems.map((item) => ({
      product: item.productID._id,
      quantity: item.quantity,
      price: item.productID.price,
    }));

    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const order = new Order({
      user: userID,
      items: orderItems,
      totalAmount,
    });

    await order.save(session ? { session } : undefined);

    const deleteQuery = Cart.deleteMany({ userID });
    if (session) deleteQuery.session(session);
    await deleteQuery;

    return order;
  }

  async getOrdersByUser(userID) {
    try {
      return await Order.find({ user: userID })
        .populate("items.product", "name imageUrl")
        .sort({ createdAt: -1 });
    } catch (err) {
      throw new ApplicationError("Error fetching orders", 500);
    }
  }

  async getOrderById(orderID, userID) {
    try {
      return await Order.findOne({ _id: orderID, user: userID })
        .populate("items.product", "name price imageUrl");
    } catch (err) {
      throw new ApplicationError("Error fetching order", 500);
    }
  }
}
