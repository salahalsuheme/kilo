import { Router, type IRouter } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { resolveUploadsDir } from "../../uploads-path.js";
import {
  handleChangePassword,
  handleGetMe,
  handleLogin,
  handleLogout,
  handleUpdateProfile,
  handleUploadProfilePhoto,
} from "./controller.js";

const uploadDir = resolveUploadsDir();
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `profile-${Date.now()}${ext}`);
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

router.post("/auth/login", handleLogin);
router.post("/auth/logout", handleLogout);
router.get("/auth/me", handleGetMe);
router.put("/auth/profile", handleUpdateProfile);
router.put("/auth/password", handleChangePassword);
router.post("/auth/profile-photo", upload.single("file"), handleUploadProfilePhoto);

export default router;
