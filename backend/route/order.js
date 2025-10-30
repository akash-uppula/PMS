import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { requireRole } from "../middleware/requireRole.js";
import {
  getOrders,
  getOrderById,
  cancelOrder,
  completeOrder,
  deleteOrder
} from "../controller/order.js";

const orderRouter = express.Router();

orderRouter.use(verifyToken, requireRole("employee"));
orderRouter.get("/orders", getOrders);
orderRouter.get("/orders/:_id", getOrderById);
orderRouter.put("/orders/cancel/:_id", cancelOrder);
orderRouter.put("/orders/complete/:_id", completeOrder);
orderRouter.delete("/orders/:_id", deleteOrder);

export default orderRouter;
