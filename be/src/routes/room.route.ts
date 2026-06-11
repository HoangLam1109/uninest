import express from "express";
import {
  createRoom,
  deleteRoom,
  deleteRoomImage,
  getAllRooms,
  getMyRooms,
  getRoomById,
  getRoomImages,
  getTenantListByLandlord,
  publishRoom,
  searchRooms,
  setPrimaryImage,
  unpublishRoom,
  updateRoom,
  uploadRoomImage,
} from "../controllers/room.controller.js";
import authenticateMiddleware from "../middlewares/authenticate.middleware.js";
import { uploadSingleImage } from "../middlewares/upload.middleware.js";

const router = express.Router();

router.post("/create", authenticateMiddleware.authenticateUser, createRoom);
router.get("/getAll", getAllRooms);
router.get("/my", authenticateMiddleware.authenticateUser, getMyRooms);
router.get("/search", searchRooms);
router.get("/getById/:id", getRoomById);
router.put("/update/:id", authenticateMiddleware.authenticateUser, updateRoom);
router.delete("/delete/:id", authenticateMiddleware.authenticateUser, deleteRoom);

// Publish/Unpublish
router.patch(
  "/:id/publish",
  authenticateMiddleware.authenticateUser,
  publishRoom
);
router.patch(
  "/:id/unpublish",
  authenticateMiddleware.authenticateUser,
  unpublishRoom
);

// Tenants
router.get(
  "/tenants",
  authenticateMiddleware.authenticateUser,
  getTenantListByLandlord
);

// Room Images
router.post(
  "/:id/images",
  authenticateMiddleware.authenticateUser,
  uploadSingleImage,
  uploadRoomImage
);
router.get("/:id/images", getRoomImages);
router.patch(
  "/:id/images/:imageId/primary",
  authenticateMiddleware.authenticateUser,
  setPrimaryImage
);
router.delete(
  "/:id/images/:imageId",
  authenticateMiddleware.authenticateUser,
  deleteRoomImage
);

export default router;
