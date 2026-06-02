import type { Request, Response } from "express";
import mongoose from "mongoose";
import { PropertyService } from "../services/property.service.js";

/**
 * CREATE PROPERTY
 */
export const createProperty = async (req: Request, res: Response) => {
  try {
    const landlordId = req.userId;
    if (!landlordId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const { name, address, city, district, ward, latitude, longitude, totalRooms, description, coverImageUrl } =
      req.body;

    // Validation
    if (!name || !address) {
      return res.status(400).json({
        success: false,
        message: "Name and address are required",
      });
    }

    const property = await PropertyService.createProperty(
      {
        name,
        address,
        city,
        district,
        ward,
        latitude,
        longitude,
        totalRooms,
        description,
        coverImageUrl,
      },
      landlordId
    );

    return res.status(201).json({
      success: true,
      message: "Property created successfully",
      data: property,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET ALL PROPERTIES (Landlord)
 */
export const getAllProperties = async (req: Request, res: Response) => {
  try {
    const landlordId = req.userId;
    if (!landlordId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const { city, district, search, page = 1, limit = 10 } = req.query;

    const filter: any = { landlordId, deletedAt: null };

    if (city) filter.city = city;
    if (district) filter.district = district;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
      ];
    }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const { properties, total } = await PropertyService.getAllProperties(
      filter,
      skip,
      limitNumber
    );

    return res.json({
      success: true,
      data: properties,
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

/**
 * GET PROPERTY BY ID (Landlord)
 */
export const getPropertyById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const landlordId = req.userId;

    if (!landlordId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    if (!mongoose.Types.ObjectId.isValid(id as string))
      return res.status(400).json({ success: false, message: "Invalid id" });

    const property = await PropertyService.getPropertyById(id as string, landlordId);

    if (!property)
      return res.status(404).json({ success: false, message: "Property not found" });

    return res.json({ success: true, data: property });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * UPDATE PROPERTY (Landlord)
 */
export const updateProperty = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const landlordId = req.userId;

    if (!landlordId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    if (!mongoose.Types.ObjectId.isValid(id as string))
      return res.status(400).json({ success: false, message: "Invalid id" });

    const property = await PropertyService.updateProperty(
      id as string,
      landlordId,
      req.body
    );

    if (!property)
      return res.status(404).json({ success: false, message: "Property not found" });

    return res.json({
      success: true,
      message: "Property updated successfully",
      data: property,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * DELETE PROPERTY (Soft Delete)
 */
export const deleteProperty = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const landlordId = req.userId;

    if (!landlordId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    if (!mongoose.Types.ObjectId.isValid(id as string))
      return res.status(400).json({ success: false, message: "Invalid id" });

    const property = await PropertyService.deleteProperty(id as string, landlordId);

    if (!property)
      return res.status(404).json({ success: false, message: "Property not found" });

    return res.json({
      success: true,
      message: "Property deleted successfully",
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET PROPERTY BY ID (Public)
 */
export const getPropertyByIdPublic = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id as string))
      return res.status(400).json({ success: false, message: "Invalid id" });

    const property = await PropertyService.getPropertyByIdPublic(id as string);

    if (!property)
      return res.status(404).json({ success: false, message: "Property not found" });

    return res.json({ success: true, data: property });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
