import express from "express";
import {
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeesByManager,
  getEmployeesByOrganizationAdmin,
  toggleEmployeeStatus,
  markEmployeeAttendance,
  viewEmployeeAttendanceByManager,
  viewEmployeeAttendanceByOrganizationAdmin,
  updateEmployeeAttendance,
  checkTodayEmployeeAttendance,
  getFinalizedQuotationsForManager,
  getCompletedOrdersForManager,
  getManagerSalesReport,
} from "../controller/employee.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { loginUser } from "../controller/user.js";
import { requireRole } from "../middleware/requireRole.js";

const employeeRouter = express.Router();

employeeRouter.post(
  "/manager/employees",
  verifyToken,
  requireRole("manager"),
  createEmployee
);

employeeRouter.put(
  "/manager/employees/:_id",
  verifyToken,
  requireRole("manager"),
  updateEmployee
);

employeeRouter.delete(
  "/manager/employees/:_id",
  verifyToken,
  requireRole("manager"),
  deleteEmployee
);

employeeRouter.get(
  "/manager/employees",
  verifyToken,
  requireRole("manager"),
  getEmployeesByManager
);

employeeRouter.get(
  "/organization-admin/managers/:_id/employees",
  verifyToken,
  requireRole("organization-admin"),
  getEmployeesByOrganizationAdmin
);

employeeRouter.patch(
  "/manager/employees/:_id/status",
  verifyToken,
  requireRole("manager"),
  toggleEmployeeStatus
);

employeeRouter.get(
  "/manager/employees/:_id/attendance",
  verifyToken,
  requireRole("manager"),
  viewEmployeeAttendanceByManager
);

employeeRouter.get(
  "/organization-admin/manager/employees/:_id/attendance",
  verifyToken,
  requireRole("organization-admin"),
  viewEmployeeAttendanceByOrganizationAdmin
);

employeeRouter.put(
  "/manager/employees/:_id/attendance",
  verifyToken,
  requireRole("manager"),
  updateEmployeeAttendance
);

employeeRouter.post(
  "/employee/attendance/mark",
  verifyToken,
  requireRole("employee"),
  markEmployeeAttendance
);

employeeRouter.get(
  "/employee/attendance/today",
  verifyToken,
  requireRole("employee"),
  checkTodayEmployeeAttendance
);

employeeRouter.get(
  "/manager/finalized-quotations",
  verifyToken,
  requireRole("manager"),
  getFinalizedQuotationsForManager
);

employeeRouter.get(
  "/manager/completed-orders",
  verifyToken,
  requireRole("manager"),
  getCompletedOrdersForManager
);

employeeRouter.get(
  "/manager/sales-report",
  verifyToken,
  requireRole("manager"),
  getManagerSalesReport
);

employeeRouter.post("/employee/login", loginUser);

export default employeeRouter;
