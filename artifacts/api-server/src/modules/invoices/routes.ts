import { Router, type IRouter } from "express";
import {
  handleDownloadInvoicePdf,
  handleGetInvoice,
  handleListInvoices,
  handleUpdateInvoice,
  handleUpdateInvoiceStatus,
} from "./controller.js";

const router: IRouter = Router();

router.get("/invoices", handleListInvoices);
router.get("/invoices/:id", handleGetInvoice);
router.patch("/invoices/:id", handleUpdateInvoice);
router.patch("/invoices/:id/status", handleUpdateInvoiceStatus);
router.get("/invoices/:id/pdf", handleDownloadInvoicePdf);

export default router;
