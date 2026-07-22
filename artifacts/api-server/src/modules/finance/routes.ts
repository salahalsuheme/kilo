import { Router, type IRouter } from "express";
import {
  handleCreateCompanyAsset,
  handleCreateFixedSubscription,
  handleCreatePurchase,
  handleDeleteCompanyAsset,
  handleDeleteFixedSubscription,
  handleDeletePurchase,
  handleGetCompanyAsset,
  handleGetFinanceReport,
  handleGetFixedSubscription,
  handleGetPurchase,
  handleListCompanyAssets,
  handleListFixedSubscriptions,
  handleListPurchases,
  handleListSubscriptionInvoices,
  handleUpdateCompanyAsset,
  handleUpdateFixedSubscription,
  handleUpdatePurchase,
  handleUpdatePurchaseStatus,
  handleUpdateSubscriptionInvoiceStatus,
} from "./controller.js";

const router: IRouter = Router();

router.get("/finance/reports", handleGetFinanceReport);
router.get("/finance/purchases", handleListPurchases);
router.post("/finance/purchases", handleCreatePurchase);
router.get("/finance/purchases/:id", handleGetPurchase);
router.put("/finance/purchases/:id", handleUpdatePurchase);
router.delete("/finance/purchases/:id", handleDeletePurchase);
router.patch("/finance/purchases/:id/status", handleUpdatePurchaseStatus);
router.get("/finance/fixed-subscriptions", handleListFixedSubscriptions);
router.post("/finance/fixed-subscriptions", handleCreateFixedSubscription);
router.get("/finance/fixed-subscriptions/:id", handleGetFixedSubscription);
router.put("/finance/fixed-subscriptions/:id", handleUpdateFixedSubscription);
router.delete("/finance/fixed-subscriptions/:id", handleDeleteFixedSubscription);
router.get("/finance/subscription-invoices", handleListSubscriptionInvoices);
router.patch("/finance/subscription-invoices/:id/status", handleUpdateSubscriptionInvoiceStatus);
router.get("/finance/assets", handleListCompanyAssets);
router.post("/finance/assets", handleCreateCompanyAsset);
router.get("/finance/assets/:id", handleGetCompanyAsset);
router.put("/finance/assets/:id", handleUpdateCompanyAsset);
router.delete("/finance/assets/:id", handleDeleteCompanyAsset);

export default router;
