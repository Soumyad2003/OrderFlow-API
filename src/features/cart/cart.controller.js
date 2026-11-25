import CartItemsRepository from "./cart.repository.js";

export class CartItemsController {
  constructor() {
    this.cartItemsRepository = new CartItemsRepository();
  }

  async add(req, res, next) {
    try {
      const { productID, quantity } = req.body;
      if (!productID) {
        return res.status(400).json({ success: false, message: "productID is required" });
      }
      const cartItem = await this.cartItemsRepository.add(
        productID, req.userID, quantity || 1
      );
      res.status(201).json({ success: true, message: "Item added to cart", cartItem });
    } catch (err) {
      next(err);
    }
  }

  async get(req, res, next) {
    try {
      const items = await this.cartItemsRepository.get(req.userID);
      res.status(200).json({ success: true, count: items.length, items });
    } catch (err) {
      next(err);
    }
  }

  async updateQuantity(req, res, next) {
    try {
      const { quantity } = req.body;
      if (!quantity || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: "Valid quantity is required (minimum 1)",
        });
      }
      const item = await this.cartItemsRepository.updateQuantity(
        req.params.id, req.userID, quantity
      );
      if (!item) {
        return res.status(404).json({ success: false, message: "Cart item not found" });
      }
      res.status(200).json({ success: true, message: "Cart item updated", item });
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      const item = await this.cartItemsRepository.delete(req.params.id, req.userID);
      if (!item) {
        return res.status(404).json({ success: false, message: "Cart item not found" });
      }
      res.status(200).json({ success: true, message: "Item removed from cart" });
    } catch (err) {
      next(err);
    }
  }
}
