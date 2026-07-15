import { Router, type IRouter } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { resolveUploadsDir } from "../../uploads-path.js";
import {
  handleGetSettings,
  handlePutSettings,
  handleUploadLogo,
} from "./controller.js";

const uploadDir = resolveUploadsDir();
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `logo-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("نوع الملف غير مدعوم"));
  },
});

const router: IRouter = Router();

router.get("/settings", handleGetSettings);
router.put("/settings", handlePutSettings);
router.post("/settings/logo", upload.single("file"), handleUploadLogo);

export default router;
