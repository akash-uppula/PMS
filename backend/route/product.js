import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { requireRole } from "../middleware/requireRole.js";
import { upload } from "../middleware/uploadImage.js";
import {
  addProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  addStock,
  removeStock,
} from "../controller/product.js";

const productRouter = express.Router();

productRouter.use(verifyToken, requireRole("organization-admin"));

productRouter.post("/products", upload.single("image"), addProduct);

productRouter.get("/products", getAllProducts);

productRouter.get("/products/:_id", getProductById);

productRouter.put("/products/:_id", upload.single("image"), updateProduct);

productRouter.delete("/products/:_id", deleteProduct);

productRouter.put("/products/add-stock/:_id", addStock);

productRouter.put("/products/remove-stock/:_id", removeStock);

export default productRouter;
