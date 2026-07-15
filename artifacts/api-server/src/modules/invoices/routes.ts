import { Router, type IRouter } from "express";
import { handleDownloadInvoicePdf, handleGetInvoice, handleListInvoices } from "./controller.js";

const router: IRouter = Router();

router.get("/invoices", handleListInvoices);
router.get("/invoices/:id", handleGetInvoice);
router.get("/invoices/:id/pdf", handleDownloadInvoicePdf);

export default router;
