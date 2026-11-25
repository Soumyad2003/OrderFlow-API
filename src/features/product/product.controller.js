import ProductRepository from "./product.repository.js";

export default class ProductController {
  constructor() {
    this.productRepository = new ProductRepository();
  }

  async getAllProducts(req, res, next) {
    try {
      const products = await this.productRepository.getAll();
      res.status(200).json({ success: true, count: products.length, products });
    } catch (err) {
      next(err);
    }
  }

  async addProduct(req, res, next) {
    try {
      const { name, price, description, category, sizes, inStock } = req.body;

      if (!name || !price) {
        return res.status(400).json({
          success: false,
          message: "Name and price are required",
        });
      }

      const productData = {
        name,
        description,
        price: parseFloat(price),
        imageUrl: req.file ? req.file.filename : undefined,
        category: category ? category.split(",").map((c) => c.trim()) : [],
        sizes: sizes ? sizes.split(",").map((s) => s.trim()) : [],
        inStock: inStock ? parseInt(inStock) : 0,
      };

      const product = await this.productRepository.add(productData);
      res.status(201).json({ success: true, message: "Product created", product });
    } catch (err) {
      next(err);
    }
  }

  async getOneProduct(req, res, next) {
    try {
      const product = await this.productRepository.get(req.params.id);
      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }
      res.status(200).json({ success: true, product });
    } catch (err) {
      next(err);
    }
  }

  async updateProduct(req, res, next) {
    try {
      const product = await this.productRepository.update(req.params.id, req.body);
      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }
      res.status(200).json({ success: true, message: "Product updated", product });
    } catch (err) {
      next(err);
    }
  }

  async deleteProduct(req, res, next) {
    try {
      const product = await this.productRepository.delete(req.params.id);
      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }
      res.status(200).json({ success: true, message: "Product deleted" });
    } catch (err) {
      next(err);
    }
  }

  async rateProduct(req, res, next) {
    try {
      const { productID, rating } = req.body;
      if (!productID || !rating) {
        return res.status(400).json({
          success: false,
          message: "productID and rating are required",
        });
      }
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: "Rating must be between 1 and 5",
        });
      }
      const review = await this.productRepository.rateProduct(
        req.userID, productID, rating
      );
      res.status(200).json({ success: true, message: "Rating saved", review });
    } catch (err) {
      next(err);
    }
  }

  async filterProducts(req, res, next) {
    try {
      const { minPrice, maxPrice, category } = req.query;
      const result = await this.productRepository.filter(minPrice, maxPrice, category);
      res.status(200).json({ success: true, count: result.length, products: result });
    } catch (err) {
      next(err);
    }
  }

  async averagePrice(req, res, next) {
    try {
      const result = await this.productRepository.averageProductPriceCategory();
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}
