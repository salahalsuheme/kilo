import { Router, type IRouter } from "express";
import { correspondenceMessageUpload } from "../../storage/correspondence-attachment-upload.js";
import {
  handleCreateCorrespondence,
  handleCreateCorrespondenceTemplate,
  handleDeleteCorrespondence,
  handleDeleteCorrespondenceTemplate,
  handleDownloadCorrespondenceAttachment,
  handleGetCorrespondence,
  handleGetCorrespondenceTemplate,
  handleListCorrespondenceTemplates,
  handleListCorrespondences,
  handleResendCorrespondence,
  handleUpdateCorrespondence,
  handleUpdateCorrespondenceTemplate,
} from "./controller.js";

const router: IRouter = Router();

router.get("/correspondences", handleListCorrespondences);
router.post("/correspondences", correspondenceMessageUpload, handleCreateCorrespondence);
router.get("/correspondences/:id", handleGetCorrespondence);
router.put("/correspondences/:id", correspondenceMessageUpload, handleUpdateCorrespondence);
router.delete("/correspondences/:id", handleDeleteCorrespondence);
router.post("/correspondences/:id/resend", handleResendCorrespondence);
router.get(
  "/correspondences/:id/attachments/:attachmentId",
  handleDownloadCorrespondenceAttachment,
);

router.get("/correspondence-templates", handleListCorrespondenceTemplates);
router.post("/correspondence-templates", handleCreateCorrespondenceTemplate);
router.get("/correspondence-templates/:id", handleGetCorrespondenceTemplate);
router.put("/correspondence-templates/:id", handleUpdateCorrespondenceTemplate);
router.delete("/correspondence-templates/:id", handleDeleteCorrespondenceTemplate);

export default router;
