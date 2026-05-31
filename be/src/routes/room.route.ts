import express from "express";
import { createRoom, deleteRoom, getAllRooms, getRoomById, updateRoom } from "../controllers/room.controller.js";
import authenticateMiddleware from "../middlewares/authenticate.middleware.js";

const router = express.Router();

router.post("/create", authenticateMiddleware.authenticateUser, createRoom);
router.get("/getAll", authenticateMiddleware.authenticateUser, getAllRooms);
router.get("/getById/:id", authenticateMiddleware.authenticateUser, getRoomById);
router.put("/update/:id", authenticateMiddleware.authenticateUser, updateRoom);
router.delete("/delete/:id", authenticateMiddleware.authenticateUser, deleteRoom);

export default router;