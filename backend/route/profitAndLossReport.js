import express from "express";
import { getOrgAdminPLReport } from "../controller/profitAndLossReport.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { requireRole } from "../middleware/requireRole.js";

const profitAndLossReportRouter = express.Router();

profitAndLossReportRouter.get(
  "/pl-report",
  verifyToken,
  requireRole("organization-admin"),
  getOrgAdminPLReport
);

export default profitAndLossReportRouter;
