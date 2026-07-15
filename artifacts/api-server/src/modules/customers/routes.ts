import { Router, type IRouter } from "express";
import {
  handleCreateCustomer,
  handleDeleteCustomer,
  handleGetCustomer,
  handleListCustomers,
  handleUpdateCustomer,
} from "./controller.js";

const router: IRouter = Router();

router.get("/customers", handleListCustomers);
router.post("/customers", handleCreateCustomer);
router.get("/customers/:id", handleGetCustomer);
router.put("/customers/:id", handleUpdateCustomer);
router.delete("/customers/:id", handleDeleteCustomer);

export default router;
