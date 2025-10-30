import express from "express";
import { registerHostAdmin } from "../controller/hostAdmin.js";
import { loginUser } from "../controller/user.js";

const hostAdminRouter = express.Router();

hostAdminRouter.post("/register", registerHostAdmin);
hostAdminRouter.post("/login", loginUser);

export default hostAdminRouter;
