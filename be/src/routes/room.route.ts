import express from "express";
import {
  createRoom,
  deleteRoom,
  deleteRoomImage,
  getAllRooms,
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

const router = express.Router();

router.post("/create", authenticateMiddleware.authenticateUser, createRoom);
router.get("/getAll", authenticateMiddleware.authenticateUser, getAllRooms);
router.get("/getTenantByLandlord", authenticateMiddleware.authenticateUser, getTenantListByLandlord);
router.get("/search", authenticateMiddleware.authenticateUser, searchRooms);
router.get("/getById/:id", authenticateMiddleware.authenticateUser, getRoomById);
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