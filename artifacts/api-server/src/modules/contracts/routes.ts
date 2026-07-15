import { Router, type IRouter } from "express";
import {
  handleCreateContract,
  handleCreateContractTemplate,
  handleDeleteContract,
  handleDeleteContractTemplate,
  handleDownloadContractPdf,
  handleGetContract,
  handleGetContractTemplate,
  handleListContractTemplates,
  handleListContracts,
  handleUpdateContract,
  handleUpdateContractStatus,
  handleUpdateContractTemplate,
} from "./controller.js";

const router: IRouter = Router();

router.get("/contracts", handleListContracts);
router.post("/contracts", handleCreateContract);
router.get("/contracts/:id", handleGetContract);
router.get("/contracts/:id/pdf", handleDownloadContractPdf);
router.put("/contracts/:id", handleUpdateContract);
router.delete("/contracts/:id", handleDeleteContract);
router.patch("/contracts/:id/status", handleUpdateContractStatus);

router.get("/contract-templates", handleListContractTemplates);
router.post("/contract-templates", handleCreateContractTemplate);
router.get("/contract-templates/:id", handleGetContractTemplate);
router.put("/contract-templates/:id", handleUpdateContractTemplate);
router.delete("/contract-templates/:id", handleDeleteContractTemplate);

export default router;
