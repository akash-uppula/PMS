import express from "express";
import { getSalesReport } from "../controller/salesReport.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { requireRole } from "../middleware/requireRole.js";

const salesReportRouter = express.Router();

salesReportRouter.get(
  "/sales",
  verifyToken,
  requireRole("organization-admin"),
  getSalesReport
);

export default salesReportRouter;
