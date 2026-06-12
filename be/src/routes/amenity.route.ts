import express from "express";
import {
  createAmenity,
  deleteAmenity,
  getAmenities,
  updateAmenity,
} from "../controllers/amenity.controller.js";
import authenticateMiddleware from "../middlewares/authenticate.middleware.js";

const router = express.Router();

router.get("/", getAmenities);
router.post("/", authenticateMiddleware.authenticateUser, createAmenity);
router.put("/:id", authenticateMiddleware.authenticateUser, updateAmenity);
router.delete("/:id", authenticateMiddleware.authenticateUser, deleteAmenity);

export default router;
