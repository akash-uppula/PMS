import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { requireRole } from "../middleware/requireRole.js";
import { getEmployeeProducts } from "../controller/employeeProduct.js";

const employeeProductRouter = express.Router();

employeeProductRouter.use(verifyToken, requireRole("employee"));
employeeProductRouter.get("/products", getEmployeeProducts);

export default employeeProductRouter;