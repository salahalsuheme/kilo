import { Router, type IRouter } from "express";
import { profilePhotoUpload } from "../../storage/image-upload.js";
import {
  handleChangePassword,
  handleGetMe,
  handleLogin,
  handleLogout,
  handleUpdateProfile,
  handleUploadProfilePhoto,
} from "./controller.js";

const router: IRouter = Router();

router.post("/auth/login", handleLogin);
router.post("/auth/logout", handleLogout);
router.get("/auth/me", handleGetMe);
router.put("/auth/profile", handleUpdateProfile);
router.put("/auth/password", handleChangePassword);
router.post("/auth/profile-photo", profilePhotoUpload.single("file"), handleUploadProfilePhoto);

export default router;
