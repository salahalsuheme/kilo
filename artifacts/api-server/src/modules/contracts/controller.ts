import type { Request, Response } from "express";
import { ListContractsQueryParams } from "@workspace/api-zod";
import {
  CONTRACT_BODY_INVALID,
  CONTRACT_TEMPLATE_BODY_INVALID,
  CreateContractBodySchema,
  CreateContractTemplateBodySchema,
  UpdateContractBodySchema,
  UpdateContractTemplateBodySchema,
  UpdateContractStatusBodySchema,
} from "@workspace/contracts-domain";
import {
  firstZodErrorMessage,
  getOrgId,
  getUserId,
  sendNotAuthenticated,
  sendNotFound,
} from "../../lib/http.js";
import {
  createContract,
  deleteContract,
  getContract,
  listContracts,
  updateContract,
  updateContractStatus,
} from "./service.js";
import {
  createContractTemplate,
  deleteContractTemplate,
  getContractTemplateById,
  listContractTemplates,
  updateContractTemplate,
} from "./template-service.js";
import { buildContractPdf } from "../print/pdf-service.js";

function requireSession(req: Request, res: Response): number | null {
  const orgId = getOrgId(req);
  const userId = getUserId(req);
  if (!orgId || !userId) {
    sendNotAuthenticated(res);
    return null;
  }
  return orgId;
}

function sendServiceError(res: Response, result: unknown): boolean {
  if (
    result &&
    typeof result === "object" &&
    "error" in result &&
    typeof (result as { error: unknown }).error === "string"
  ) {
    res.status(400).json({ message: (result as { error: string }).error });
    return true;
  }
  return false;
}

export async function handleListContracts(req: Request, res: Response): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;

  const parsed = ListContractsQueryParams.safeParse(req.query);
  const params = parsed.success ? parsed.data : {};
  res.json(await listContracts(orgId, params));
}

export async function handleGetContract(req: Request, res: Response): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;

  const id = Number(req.params.id);
  const contract = await getContract(orgId, id);
  if (!contract) {
    sendNotFound(res);
    return;
  }
  res.json(contract);
}

export async function handleDownloadContractPdf(req: Request, res: Response): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;

  const id = Number(req.params.id);
  const result = await buildContractPdf(orgId, id);
  if (!result) {
    sendNotFound(res);
    return;
  }

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${result.filename}"`);
  res.send(result.pdf);
}

export async function handleCreateContract(req: Request, res: Response): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;

  const parsed = CreateContractBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: firstZodErrorMessage(parsed.error, CONTRACT_BODY_INVALID) });
    return;
  }

  const result = await createContract(orgId, parsed.data);
  if (sendServiceError(res, result)) return;
  res.status(201).json(result.data);
}

export async function handleUpdateContract(req: Request, res: Response): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;

  const parsed = UpdateContractBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: firstZodErrorMessage(parsed.error, CONTRACT_BODY_INVALID) });
    return;
  }

  const id = Number(req.params.id);
  const result = await updateContract(orgId, id, parsed.data);
  if (!result) {
    sendNotFound(res);
    return;
  }
  if (sendServiceError(res, result)) return;
  res.json(result.data);
}

export async function handleDeleteContract(req: Request, res: Response): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;

  const id = Number(req.params.id);
  const result = await deleteContract(orgId, id);
  if (result === false) {
    sendNotFound(res);
    return;
  }
  if (typeof result === "object" && sendServiceError(res, result)) return;
  res.status(204).end();
}

export async function handleUpdateContractStatus(req: Request, res: Response): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;

  const parsed = UpdateContractStatusBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: firstZodErrorMessage(parsed.error, CONTRACT_BODY_INVALID) });
    return;
  }

  const id = Number(req.params.id);
  const result = await updateContractStatus(orgId, id, parsed.data);
  if (!result) {
    sendNotFound(res);
    return;
  }
  if (sendServiceError(res, result)) return;
  res.json(result.data);
}

export async function handleListContractTemplates(req: Request, res: Response): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;
  res.json(await listContractTemplates(orgId));
}

export async function handleGetContractTemplate(req: Request, res: Response): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;

  const id = Number(req.params.id);
  const template = await getContractTemplateById(orgId, id);
  if (!template) {
    sendNotFound(res);
    return;
  }
  res.json(template);
}

export async function handleCreateContractTemplate(req: Request, res: Response): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;

  const parsed = CreateContractTemplateBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res
      .status(400)
      .json({ message: firstZodErrorMessage(parsed.error, CONTRACT_TEMPLATE_BODY_INVALID) });
    return;
  }

  const template = await createContractTemplate(orgId, parsed.data);
  res.status(201).json(template);
}

export async function handleUpdateContractTemplate(req: Request, res: Response): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;

  const parsed = UpdateContractTemplateBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res
      .status(400)
      .json({ message: firstZodErrorMessage(parsed.error, CONTRACT_TEMPLATE_BODY_INVALID) });
    return;
  }

  const id = Number(req.params.id);
  const template = await updateContractTemplate(orgId, id, parsed.data);
  if (!template) {
    sendNotFound(res);
    return;
  }
  res.json(template);
}

export async function handleDeleteContractTemplate(req: Request, res: Response): Promise<void> {
  const orgId = requireSession(req, res);
  if (!orgId) return;

  const id = Number(req.params.id);
  const ok = await deleteContractTemplate(orgId, id);
  if (!ok) {
    sendNotFound(res);
    return;
  }
  res.status(204).end();
}
