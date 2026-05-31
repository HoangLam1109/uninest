import type { Request, Response } from "express";
import mongoose from "mongoose";
import { RoomService } from "../services/room.service.js";

/**
 * CREATE ROOM
 */
export const createRoom = async (req: Request, res: Response) => {
  try {
    const landlordId = req.user?.id;
    if (!landlordId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const room = await RoomService.createRoom(req.body, landlordId);

    return res.status(201).json({
      success: true,
      message: "Room created successfully",
      data: room,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET ALL
 */
export const getAllRooms = async (req: Request, res: Response) => {
  try {
    const { city, district, status, minPrice, maxPrice, page = 1, limit = 10 } =
      req.query;

    const filter: any = {};

    if (city) filter.city = city;
    if (district) filter.district = district;
    if (status) filter.status = status;

    if (minPrice || maxPrice) {
      filter.pricePerMonth = {};
      if (minPrice) filter.pricePerMonth.$gte = Number(minPrice);
      if (maxPrice) filter.pricePerMonth.$lte = Number(maxPrice);
    }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const { rooms, total } = await RoomService.getAllRooms(
      filter,
      skip,
      limitNumber
    );

    return res.json({
      success: true,
      data: rooms,
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
 * SEARCH
 */
export const searchRooms = async (req: Request, res: Response) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    const keyword =
      q && typeof q === "string"
        ? {
            $or: [
              { title: { $regex: q, $options: "i" } },
              { address: { $regex: q, $options: "i" } },
              { city: { $regex: q, $options: "i" } },
              { district: { $regex: q, $options: "i" } },
            ],
          }
        : {};

    const skip = (Number(page) - 1) * Number(limit);

    const { rooms, total } = await RoomService.searchRooms(
      keyword,
      skip,
      Number(limit)
    );

    return res.json({
      success: true,
      data: rooms,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET BY ID
 */
export const getRoomById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id as string))
      return res.status(400).json({ success: false, message: "Invalid id" });

    const room = await RoomService.getRoomById(id as string);

    if (!room)
      return res.status(404).json({ success: false, message: "Not found" });

    return res.json({ success: true, data: room });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * UPDATE
 */
export const updateRoom = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const landlordId = req.user?.id;

    const room = await RoomService.updateRoom(id as string, landlordId, req.body);

    if (!room)
      return res.status(404).json({ success: false, message: "Not found" });

    return res.json({ success: true, data: room });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * DELETE
 */
export const deleteRoom = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const landlordId = req.user?.id;

    const room = await RoomService.deleteRoom(id as string, landlordId);

    if (!room)
      return res.status(404).json({ success: false, message: "Not found" });

    return res.json({ success: true, message: "Deleted successfully" });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};