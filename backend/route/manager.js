import express from "express";
import {
  createManager,
  updateManager,
  deleteManager,
  getAllManagers,
  toggleManagerStatus,
  markManagerAttendance,
  viewManagerAttendance,
  updateManagerAttendance,
  getOrgAdminManagerSalesReport,
  checkTodayManagerAttendance,
} from "../controller/manager.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { loginUser } from "../controller/user.js";
import { requireRole } from "../middleware/requireRole.js";

const managerRouter = express.Router();

managerRouter.post(
  "/organization-admin/managers",
  verifyToken,
  requireRole("organization-admin"),
  createManager
);

managerRouter.put(
  "/organization-admin/managers/:_id",
  verifyToken,
  requireRole("organization-admin"),
  updateManager
);

managerRouter.delete(
  "/organization-admin/managers/:_id",
  verifyToken,
  requireRole("organization-admin"),
  deleteManager
);

managerRouter.get(
  "/organization-admin/managers",
  verifyToken,
  requireRole("organization-admin"),
  getAllManagers
);

managerRouter.patch(
  "/organization-admin/managers/:_id/status",
  verifyToken,
  requireRole("organization-admin"),
  toggleManagerStatus
);

managerRouter.get(
  "/organization-admin/managers/:_id/attendance",
  verifyToken,
  requireRole("organization-admin"),
  viewManagerAttendance
);

managerRouter.put(
  "/organization-admin/managers/:_id/attendance",
  verifyToken,
  requireRole("organization-admin"),
  updateManagerAttendance
);

managerRouter.get(
  "/organization-admin/manager/sales-report",
  verifyToken,
  requireRole("organization-admin"),
  getOrgAdminManagerSalesReport
);

managerRouter.post(
  "/manager/attendance/mark",
  verifyToken,
  requireRole("manager"),
  markManagerAttendance
);

managerRouter.get(
  "/manager/attendance/today",
  verifyToken,
  requireRole("manager"),
  checkTodayManagerAttendance
);

managerRouter.post("/manager/login", loginUser);

export default managerRouter;
