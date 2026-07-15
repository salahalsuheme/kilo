import { Router, type IRouter } from "express";
import {
  handleGetDashboardSummary,
  handleListActivityEvents,
} from "./controller.js";

const router: IRouter = Router();

router.get("/dashboard/summary", handleGetDashboardSummary);
router.get("/activity-events", handleListActivityEvents);

export default router;
