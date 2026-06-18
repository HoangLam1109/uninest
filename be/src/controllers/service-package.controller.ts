import type { Request, Response } from "express";
import mongoose from "mongoose";
import { ServicePackageService } from "../services/service-package.service.js";

export const createPackage = async (req: Request, res: Response) => {
  try {
    const { name, price, durationDays, description, features, maxRooms } = req.body;

    if (!name || !price || !durationDays) {
      return res.status(400).json({
        success: false,
        message: "Name, price, and durationDays are required",
      });
    }

    const pkg = await ServicePackageService.create({
      name,
      price,
      durationDays,
      description,
      features,
      maxRooms,
    });

    return res.status(201).json({
      success: true,
      message: "Service package created",
      data: pkg,
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const getPackageById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const pkg = await ServicePackageService.getById(id);
    return res.json({ success: true, data: pkg });
  } catch (err: any) {
    return res.status(404).json({ success: false, message: err.message });
  }
};

export const getAllPackages = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNumber = Math.max(1, Number(page));
    const limitNumber = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNumber - 1) * limitNumber;

    const { packages, total } = await ServicePackageService.getAll(skip, limitNumber);

    return res.json({
      success: true,
      data: packages,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getActivePackages = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNumber = Math.max(1, Number(page));
    const limitNumber = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNumber - 1) * limitNumber;

    const { packages, total } = await ServicePackageService.getAllActive(skip, limitNumber);

    return res.json({
      success: true,
      data: packages,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updatePackage = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const pkg = await ServicePackageService.update(id, req.body);
    return res.json({ success: true, message: "Package updated", data: pkg });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const deletePackage = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    await ServicePackageService.delete(id);
    return res.json({ success: true, message: "Package deleted" });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
};