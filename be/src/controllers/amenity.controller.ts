import type { Request, Response } from "express";
import mongoose from "mongoose";
import { AmenityService } from "../services/amenity.service.js";

function handleAmenityError(res: Response, err: any, context: string) {
  console.error(`[AmenityController] ${context}:`, err.message ?? err);

  if (err?.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Amenity already exists",
    });
  }

  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors ?? {}).map((e: any) => e.message);
    return res.status(400).json({
      success: false,
      message: messages.length > 0 ? messages.join("; ") : err.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: err.message || "Internal server error",
  });
}

function isValidId(id?: string) {
  return Boolean(id && mongoose.Types.ObjectId.isValid(id));
}

function getParamId(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}

export const getAmenities = async (_req: Request, res: Response) => {
  try {
    const amenities = await AmenityService.getAllAmenities();
    return res.json({ success: true, data: amenities });
  } catch (err: any) {
    return handleAmenityError(res, err, "getAmenities");
  }
};

export const createAmenity = async (req: Request, res: Response) => {
  try {
    const amenity = await AmenityService.createAmenity(req.body);
    return res.status(201).json({
      success: true,
      message: "Amenity created successfully",
      data: amenity,
    });
  } catch (err: any) {
    return handleAmenityError(res, err, "createAmenity");
  }
};

export const updateAmenity = async (req: Request, res: Response) => {
  try {
    const id = getParamId(req.params.id);
    if (!isValidId(id)) {
      return res.status(400).json({ success: false, message: "Invalid amenity id" });
    }

    const amenity = await AmenityService.updateAmenity(id as string, req.body);
    if (!amenity) {
      return res.status(404).json({ success: false, message: "Amenity not found" });
    }

    return res.json({
      success: true,
      message: "Amenity updated successfully",
      data: amenity,
    });
  } catch (err: any) {
    return handleAmenityError(res, err, "updateAmenity");
  }
};

export const deleteAmenity = async (req: Request, res: Response) => {
  try {
    const id = getParamId(req.params.id);
    if (!isValidId(id)) {
      return res.status(400).json({ success: false, message: "Invalid amenity id" });
    }

    const amenity = await AmenityService.deleteAmenity(id as string);
    if (!amenity) {
      return res.status(404).json({ success: false, message: "Amenity not found" });
    }

    return res.json({
      success: true,
      message: "Amenity deleted successfully",
    });
  } catch (err: any) {
    return handleAmenityError(res, err, "deleteAmenity");
  }
};
