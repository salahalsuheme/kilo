import { Router, type IRouter } from "express";
import {
  handleCreateEstablishment,
  handleDeleteEstablishment,
  handleGetEstablishment,
  handleListEstablishments,
  handleUpdateEstablishment,
} from "./controller.js";

const router: IRouter = Router();

router.get("/establishments", handleListEstablishments);
router.post("/establishments", handleCreateEstablishment);
router.get("/establishments/:id", handleGetEstablishment);
router.put("/establishments/:id", handleUpdateEstablishment);
router.delete("/establishments/:id", handleDeleteEstablishment);

export default router;
