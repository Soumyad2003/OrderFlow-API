import mongoose from "mongoose";
import { ApplicationError } from "../../error-handler/applicationError.js";
import { productSchema } from "./product.schema.js";
import { reviewSchema } from "./review.schema.js";
import { categorySchema } from "./category.schema.js";

const Product = mongoose.model("Product", productSchema);
const Review = mongoose.model("Review", reviewSchema);
const Category = mongoose.model("Category", categorySchema);

class ProductRepository {
  async add(productData) {
    try {
      const newProduct = new Product(productData);
      await newProduct.save();

      if (productData.category && productData.category.length > 0) {
        await Category.updateMany(
          { _id: { $in: productData.category } },
          { $addToSet: { products: newProduct._id } }
        );
      }

      return newProduct;
    } catch (err) {
      if (err instanceof mongoose.Error.ValidationError) throw err;
      throw new ApplicationError("Database error while adding product", 500);
    }
  }

  async getAll() {
    try {
      return await Product.find()
        .populate("category", "name")
        .sort({ createdAt: -1 });
    } catch (err) {
      throw new ApplicationError("Database error while fetching products", 500);
    }
  }

  async get(id) {
    try {
      return await Product.findById(id)
        .populate("category", "name")
        .populate({
          path: "reviews",
          populate: { path: "user", select: "name email" },
        });
    } catch (err) {
      throw new ApplicationError("Database error while fetching product", 500);
    }
  }

  async update(id, updateData) {
    try {
      const product = await Product.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });
      return product;
    } catch (err) {
      if (err instanceof mongoose.Error.ValidationError) throw err;
      throw new ApplicationError("Database error while updating product", 500);
    }
  }

  async delete(id) {
    try {
      const product = await Product.findByIdAndDelete(id);
      if (product) {
        await Review.deleteMany({ product: id });
        await Category.updateMany(
          { products: id },
          { $pull: { products: id } }
        );
      }
      return product;
    } catch (err) {
      throw new ApplicationError("Database error while deleting product", 500);
    }
  }

  async filter(minPrice, maxPrice, categories) {
    try {
      const query = {};
      if (minPrice) query.price = { ...query.price, $gte: parseFloat(minPrice) };
      if (maxPrice) query.price = { ...query.price, $lte: parseFloat(maxPrice) };
      if (categories) {
        const catArray = Array.isArray(categories) ? categories : [categories];
        query.category = { $in: catArray };
      }
      return await Product.find(query)
        .populate("category", "name")
        .select("name price imageUrl category");
    } catch (err) {
      throw new ApplicationError("Database error while filtering products", 500);
    }
  }

  async rateProduct(userID, productID, rating) {
    try {
      const product = await Product.findById(productID);
      if (!product) {
        throw new ApplicationError("Product not found", 404);
      }

      let review = await Review.findOne({ product: productID, user: userID });
      if (review) {
        review.rating = rating;
        await review.save();
      } else {
        review = new Review({
          product: productID,
          user: userID,
          rating: rating,
        });
        await review.save();
        product.reviews.push(review._id);
        await product.save();
      }
      return review;
    } catch (err) {
      if (err instanceof ApplicationError) throw err;
      throw new ApplicationError("Database error while rating product", 500);
    }
  }

  async averageProductPriceCategory() {
    try {
      return await Product.aggregate([
        { $unwind: "$category" },
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "categoryInfo",
          },
        },
        { $unwind: "$categoryInfo" },
        {
          $group: {
            _id: "$categoryInfo.name",
            averagePrice: { $avg: "$price" },
            count: { $sum: 1 },
          },
        },
        { $sort: { averagePrice: -1 } },
      ]);
    } catch (err) {
      throw new ApplicationError("Database error", 500);
    }
  }
}

export default ProductRepository;
