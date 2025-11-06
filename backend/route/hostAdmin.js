import express from "express";
import { createHostAdmin } from "../controller/hostAdmin.js";
import {updateHostAdmin} from "../controller/hostAdmin.js";
import { deleteHostAdmin } from "../controller/hostAdmin.js";
import { getAllHostAdmins } from "../controller/hostAdmin.js";
import {checkHostAdminExists} from "../controller/hostAdmin.js";
import { loginUser } from "../controller/user.js";

const hostAdminRouter = express.Router();

hostAdminRouter.post("/register", createHostAdmin);
hostAdminRouter.put("/update/:_id", updateHostAdmin);
hostAdminRouter.delete("/delete/:_id", deleteHostAdmin);
hostAdminRouter.get("/hostAdmins", getAllHostAdmins);
hostAdminRouter.get("/exists", checkHostAdminExists);
hostAdminRouter.post("/login", loginUser);

export default hostAdminRouter;
