import { Router, type IRouter } from "express";
import { signedContractAttachmentUpload } from "../../storage/signed-contract-upload.js";
import {
  handleCreateContract,
  handleCreateContractTemplate,
  handleDeleteContract,
  handleDeleteContractTemplate,
  handleDeleteContractVehicleDamageForm,
  handleDownloadContractPdf,
  handleDownloadContractSignedAttachment,
  handleGetContract,
  handleGetContractTemplate,
  handleGetContractVehicleDamageForm,
  handleListContractTemplates,
  handleListContracts,
  handleUpdateContract,
  handleUpdateContractStatus,
  handleUpdateContractTemplate,
  handleUploadContractSignedAttachment,
  handleUpsertContractVehicleDamageForm,
} from "./controller.js";

const router: IRouter = Router();

router.get("/contracts", handleListContracts);
router.post("/contracts", handleCreateContract);
router.get("/contracts/:id", handleGetContract);
router.get("/contracts/:id/pdf", handleDownloadContractPdf);
router.get("/contracts/:id/signed-attachment", handleDownloadContractSignedAttachment);
router.post(
  "/contracts/:id/signed-attachment",
  signedContractAttachmentUpload.single("file"),
  handleUploadContractSignedAttachment,
);
router.get("/contracts/:id/vehicle-damage-form", handleGetContractVehicleDamageForm);
router.put("/contracts/:id/vehicle-damage-form", handleUpsertContractVehicleDamageForm);
router.delete("/contracts/:id/vehicle-damage-form", handleDeleteContractVehicleDamageForm);
router.put("/contracts/:id", handleUpdateContract);
router.delete("/contracts/:id", handleDeleteContract);
router.patch("/contracts/:id/status", handleUpdateContractStatus);

router.get("/contract-templates", handleListContractTemplates);
router.post("/contract-templates", handleCreateContractTemplate);
router.get("/contract-templates/:id", handleGetContractTemplate);
router.put("/contract-templates/:id", handleUpdateContractTemplate);
router.delete("/contract-templates/:id", handleDeleteContractTemplate);

export default router;
