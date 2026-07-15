import { Router, type IRouter } from "express";
import {
  handleCreateVehicle,
  handleDeleteVehicle,
  handleGetVehicle,
  handleListVehicles,
  handleUpdateVehicle,
} from "./controller.js";

const router: IRouter = Router();

router.get("/vehicles", handleListVehicles);
router.post("/vehicles", handleCreateVehicle);
router.get("/vehicles/:id", handleGetVehicle);
router.put("/vehicles/:id", handleUpdateVehicle);
router.delete("/vehicles/:id", handleDeleteVehicle);

export default router;
