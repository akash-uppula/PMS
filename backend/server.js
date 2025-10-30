import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import hostAdminRouter from "./route/hostAdmin.js";
import organizationAdminRouter from "./route/organizationAdmin.js";
import managerRouter from "./route/manager.js";
import employeeRouter from "./route/employee.js";
import categoryRouter from "./route/category.js";
import productRouter from "./route/product.js";
import employeeProductRouter from "./route/employeeProduct.js"
import quotationRouter from "./route/quotation.js";
import orderRouter from "./route/order.js";
import salesReportRouter from "./route/salesReport.js";
import profitAndLossReportRouter from "./route/profitAndLossReport.js";
import revenueRouter from "./route/revenue.js";
import salaryReportRouter from "./route/salary.js";

dotenv.config();
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/host-admin", hostAdminRouter);
app.use("/api", organizationAdminRouter);
app.use("/api", managerRouter);
app.use("/api", employeeRouter);
app.use("/api/organization-admin", categoryRouter);
app.use("/api/organization-admin", productRouter);
app.use("/api/employee", employeeProductRouter);
app.use("/api/employee", quotationRouter);
app.use("/api/employee", orderRouter);
app.use("/api/organization-admin/reports", salesReportRouter);
app.use("/api/organization-admin/reports", profitAndLossReportRouter);
app.use("/api/host-admin/reports", revenueRouter);
app.use("/api/manager/salary", salaryReportRouter);
app.use("/api/organization-admin/salary", salaryReportRouter);

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log("✅ Connected to MongoDB");
    });
  })
  .catch((error) => {
    console.error("❌ MongoDB connection failed:", error.message);
  });
