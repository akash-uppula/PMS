import express from "express";
import { getEmployeeSalaryByAttendance } from "../controller/salary.js";
import { getManagerSalaryByAttendance } from "../controller/salary.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { requireRole } from "../middleware/requireRole.js";

const salaryReportRouter = express.Router();

salaryReportRouter.get(
  "/employee/:id",
  verifyToken,
  requireRole("manager"),
  getEmployeeSalaryByAttendance
);

salaryReportRouter.get(
  "/manager/:id",
  verifyToken,
  requireRole("organization-admin"),
  getManagerSalaryByAttendance
);

export default salaryReportRouter;
