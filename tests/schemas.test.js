import { describe, it } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { userSchema } from "../src/features/user/user.schema.js";
import { productSchema } from "../src/features/product/product.schema.js";
import { cartSchema } from "../src/features/cart/cart.schema.js";
import { orderSchema } from "../src/features/order/order.schema.js";
import { likeSchema } from "../src/features/like/like.schema.js";

const User = mongoose.models.TestUser || mongoose.model("TestUser", userSchema);
const Product = mongoose.models.TestProduct || mongoose.model("TestProduct", productSchema);
const Cart = mongoose.models.TestCart || mongoose.model("TestCart", cartSchema);
const Order = mongoose.models.TestOrder || mongoose.model("TestOrder", orderSchema);
const Like = mongoose.models.TestLike || mongoose.model("TestLike", likeSchema);

describe("Mongoose Schema Validations", () => {
  it("validates a valid user and rejects invalid email", () => {
    const validUser = new User({
      name: "Alice",
      email: "alice@example.com",
      password: "hashed-password",
      type: "Customer",
    });
    assert.equal(validUser.validateSync(), undefined);

    const invalidUser = new User({
      name: "Alice",
      email: "not-an-email",
      password: "hashed-password",
    });
    const err = invalidUser.validateSync();
    assert.ok(err.errors.email);
  });

  it("rejects negative product price", () => {
    const product = new Product({ name: "Phone", price: -10 });
    const err = product.validateSync();
    assert.ok(err.errors.price);
  });

  it("rejects cart quantity less than 1", () => {
    const id = new mongoose.Types.ObjectId();
    const cart = new Cart({ productID: id, userID: id, quantity: 0 });
    const err = cart.validateSync();
    assert.ok(err.errors.quantity);
  });

  it("sets default order status to Pending and rejects invalid status", () => {
    const id = new mongoose.Types.ObjectId();
    const order = new Order({ user: id, items: [], totalAmount: 100 });
    assert.equal(order.status, "Pending");
    assert.equal(order.validateSync(), undefined);

    order.status = "InvalidStatus";
    const err = order.validateSync();
    assert.ok(err.errors.status);
  });

  it("validates like on_model enum", () => {
    const id = new mongoose.Types.ObjectId();
    const validLike = new Like({ user: id, likeable: id, on_model: "Product" });
    assert.equal(validLike.validateSync(), undefined);

    const invalidLike = new Like({ user: id, likeable: id, on_model: "User" });
    const err = invalidLike.validateSync();
    assert.ok(err.errors.on_model);
  });
});

