import { Router, type IRouter } from "express";
import { handleListNotifications } from "./controller.js";

const router: IRouter = Router();

router.get("/notifications", handleListNotifications);

export default router;
