import express from "express";
import ProductController from "./product.controller.js";
import { upload } from "../../middlewares/fileupload.middleware.js";
import jwtAuth from "../../middlewares/jwt.middleware.js";

const productRouter = express.Router();
const productController = new ProductController();

productRouter.get("/filter", (req, res, next) => {
  productController.filterProducts(req, res, next);
});

productRouter.get("/averageprice", (req, res, next) => {
  productController.averagePrice(req, res, next);
});

productRouter.get("/", (req, res, next) => {
  productController.getAllProducts(req, res, next);
});

productRouter.get("/:id", (req, res, next) => {
  productController.getOneProduct(req, res, next);
});

productRouter.post("/", jwtAuth, upload.single("imageUrl"), (req, res, next) => {
  productController.addProduct(req, res, next);
});

productRouter.put("/:id", jwtAuth, (req, res, next) => {
  productController.updateProduct(req, res, next);
});

productRouter.delete("/:id", jwtAuth, (req, res, next) => {
  productController.deleteProduct(req, res, next);
});

productRouter.post("/rate", jwtAuth, (req, res, next) => {
  productController.rateProduct(req, res, next);
});

export default productRouter;
