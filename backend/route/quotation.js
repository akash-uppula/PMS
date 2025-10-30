import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { requireRole } from "../middleware/requireRole.js";
import {
  createQuotation,
  getQuotations,
  getQuotationById,
  updateQuotation,
  deleteQuotation,
  finalizeQuotation,
  convertQuotationToOrder
} from "../controller/quotation.js";

const quotationRouter = express.Router();

quotationRouter.use(verifyToken, requireRole("employee"));
quotationRouter.post("/quotations", createQuotation);
quotationRouter.get("/quotations", getQuotations);
quotationRouter.get("/quotations/:_id", getQuotationById);
quotationRouter.put("/quotations/:_id", updateQuotation);
quotationRouter.delete("/quotations/:_id", deleteQuotation);
quotationRouter.post("/quotations/finalize/:_id", finalizeQuotation);
quotationRouter.post("/quotations/convert-to-order/:_id", convertQuotationToOrder);

export default quotationRouter;
