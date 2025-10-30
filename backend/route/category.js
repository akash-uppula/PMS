import express from "express";
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controller/category.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { requireRole } from "../middleware/requireRole.js";

const categoryRouter = express.Router();

categoryRouter.use(verifyToken, requireRole("organization-admin"));

categoryRouter.post("/categories", createCategory);
categoryRouter.get("/categories", getCategories);
categoryRouter.get("/categories/:_id", getCategoryById);
categoryRouter.put("/categories/:_id", updateCategory);
categoryRouter.delete("/categories/:_id", deleteCategory);

export default categoryRouter;
