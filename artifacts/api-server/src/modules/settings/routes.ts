import { Router, type IRouter } from "express";
import { logoUpload } from "../../storage/image-upload.js";
import {
  handleGetSettings,
  handlePutSettings,
  handleUploadLogo,
} from "./controller.js";

const router: IRouter = Router();

router.get("/settings", handleGetSettings);
router.put("/settings", handlePutSettings);
router.post("/settings/logo", logoUpload.single("file"), handleUploadLogo);

export default router;
