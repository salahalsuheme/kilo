import { Router, type IRouter } from "express";
import { userPhotoUpload } from "../../storage/image-upload.js";
import {
  handleCreateUser,
  handleDeleteUser,
  handleGetUser,
  handleListUsers,
  handleUpdateUser,
  handleUploadUserPhoto,
} from "./controller.js";

const router: IRouter = Router();

router.get("/users", handleListUsers);
router.post("/users", handleCreateUser);
router.get("/users/:id", handleGetUser);
router.put("/users/:id", handleUpdateUser);
router.delete("/users/:id", handleDeleteUser);
router.post("/users/:id/photo", userPhotoUpload.single("file"), handleUploadUserPhoto);

export default router;
