import OrderRepository from "./order.repository.js";

export default class OrderController {
  constructor() {
    this.orderRepository = new OrderRepository();
  }

  async placeOrder(req, res, next) {
    try {
      const order = await this.orderRepository.placeOrder(req.userID);
      res.status(201).json({ success: true, message: "Order placed successfully", order });
    } catch (err) {
      next(err);
    }
  }

  async getOrders(req, res, next) {
    try {
      const orders = await this.orderRepository.getOrdersByUser(req.userID);
      res.status(200).json({ success: true, count: orders.length, orders });
    } catch (err) {
      next(err);
    }
  }

  async getOrderById(req, res, next) {
    try {
      const order = await this.orderRepository.getOrderById(req.params.id, req.userID);
      if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
      }
      res.status(200).json({ success: true, order });
    } catch (err) {
      next(err);
    }
  }
}
