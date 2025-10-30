import express from "express";
import { getSystemWideRevenue } from "../controller/revenue.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { requireRole } from "../middleware/requireRole.js";

const revenueRouter = express.Router();

revenueRouter.get(
  "/revenue",
  verifyToken,
  requireRole("host-admin"),
  getSystemWideRevenue
);

export default revenueRouter;
