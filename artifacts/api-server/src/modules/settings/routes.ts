import { Router, type IRouter } from "express";
import { logoUpload, signatureUpload, stampUpload } from "../../storage/image-upload.js";
import {
  handleGetSettings,
  handlePutSettings,
  handleUploadLogo,
  handleUploadSignature,
  handleUploadStamp,
} from "./controller.js";

const router: IRouter = Router();

router.get("/settings", handleGetSettings);
router.put("/settings", handlePutSettings);
router.post("/settings/logo", logoUpload.single("file"), handleUploadLogo);
router.post("/settings/stamp", stampUpload.single("file"), handleUploadStamp);
router.post("/settings/signature", signatureUpload.single("file"), handleUploadSignature);

export default router;
