import { Router, type IRouter } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { resolveUploadsDir } from "../../uploads-path.js";
import {
  handleCreateUser,
  handleDeleteUser,
  handleGetUser,
  handleListUsers,
  handleUpdateUser,
  handleUploadUserPhoto,
} from "./controller.js";

const uploadDir = resolveUploadsDir();
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const userId = req.params.id ?? "user";
    cb(null, `user-${userId}-${Date.now()}${ext}`);
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

router.get("/users", handleListUsers);
router.post("/users", handleCreateUser);
router.get("/users/:id", handleGetUser);
router.put("/users/:id", handleUpdateUser);
router.delete("/users/:id", handleDeleteUser);
router.post("/users/:id/photo", upload.single("file"), handleUploadUserPhoto);

export default router;
