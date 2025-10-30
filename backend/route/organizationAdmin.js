import express from "express";
import {
  createOrganizationAdmin,
  updateOrganizationAdmin,
  deleteOrganizationAdmin,
  getAllOrganizationAdmins,
  toggleOrganizationAdminStatus,
} from "../controller/organizationAdmin.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { loginUser } from "../controller/user.js";
import { requireRole } from "../middleware/requireRole.js";

const organizationAdminRouter = express.Router();

organizationAdminRouter.post(
  "/host-admin/organization-admins",
  verifyToken,
  requireRole("host-admin"),
  createOrganizationAdmin
);

organizationAdminRouter.put(
  "/host-admin/organization-admins/:_id",
  verifyToken,
  requireRole("host-admin"),
  updateOrganizationAdmin
);

organizationAdminRouter.delete(
  "/host-admin/organization-admins/:_id",
  verifyToken,
  requireRole("host-admin"),
  deleteOrganizationAdmin
);

organizationAdminRouter.get(
  "/host-admin/organization-admins",
  verifyToken,
  requireRole("host-admin"),
  getAllOrganizationAdmins
);

organizationAdminRouter.patch(
  "/host-admin/organization-admins/:_id/status",
  verifyToken,
  requireRole("host-admin"),
  toggleOrganizationAdminStatus
);

organizationAdminRouter.post("/organization-admin/login", loginUser);

export default organizationAdminRouter;
