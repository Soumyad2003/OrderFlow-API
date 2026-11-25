import { LikeRepository } from "./like.repository.js";

export class LikeController {
  constructor() {
    this.likeRepository = new LikeRepository();
  }

  async toggleLike(req, res, next) {
    try {
      const { id, type } = req.body;
      if (!id || !type) {
        return res.status(400).json({
          success: false,
          message: "id and type are required",
        });
      }
      if (type !== "Product" && type !== "Category") {
        return res.status(400).json({
          success: false,
          message: "Type must be 'Product' or 'Category'",
        });
      }
      const result = await this.likeRepository.toggleLike(req.userID, id, type);
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  async getLikes(req, res, next) {
    try {
      const { id, type } = req.query;
      if (!id || !type) {
        return res.status(400).json({
          success: false,
          message: "id and type query params are required",
        });
      }
      const likes = await this.likeRepository.getLikes(type, id);
      res.status(200).json({ success: true, count: likes.length, likes });
    } catch (err) {
      next(err);
    }
  }

  async unlike(req, res, next) {
    try {
      const result = await this.likeRepository.unlikeItem(req.params.id, req.userID);
      if (!result) {
        return res.status(404).json({ success: false, message: "Like not found" });
      }
      res.status(200).json({ success: true, message: "Unliked successfully" });
    } catch (err) {
      next(err);
    }
  }
}
