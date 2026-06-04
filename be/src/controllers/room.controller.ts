import type { Request, Response } from "express";
import mongoose from "mongoose";
import { configureCloudinary } from "../config/cloudinary.config.js";
import { RoomService } from "../services/room.service.js";
import { UserService } from "../services/user.service.js";

function uploadBufferToCloudinary(file: Express.Multer.File, roomId: string) {
  const cloudinary = configureCloudinary();

  return new Promise<{ secure_url: string; public_id: string }>(
    (resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `uninest/rooms/${roomId}`,
          resource_type: "image",
          transformation: [
            { width: 1600, height: 1200, crop: "limit" },
            { quality: "auto", fetch_format: "auto" },
          ],
        },
        (error, result) => {
          if (error || !result) {
            reject(error ?? new Error("Cloudinary upload failed"));
            return;
          }

          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
          });
        },
      );

      uploadStream.end(file.buffer);
    },
  );
}

/**
 * CREATE ROOM
 */
export const createRoom = async (req: Request, res: Response) => {
  try {
    const landlordId = req.userId;
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
 * GET MY ROOMS
 */
export const getMyRooms = async (req: Request, res: Response) => {
  try {
    const landlordId = req.userId;
    if (!landlordId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const { city, district, status, minPrice, maxPrice, page = 1, limit = 10 } =
      req.query;

    const filter: any = { landlordId };

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
 * GET ALL TETANT BY LANDLORD ID   
 * */
export const getTenantListByLandlord = async (
  req: Request,
  res: Response
) => {
  try {
    const landlordId = req.userId;
    if (!landlordId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const tenants =
      await RoomService.getTenantListByLandlord(
        landlordId
      );

    return res.status(200).json({
      success: true,
      data: tenants,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
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
    const landlordId = req.userId;

    if (!landlordId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    if (!mongoose.Types.ObjectId.isValid(id as string))
      return res.status(400).json({ success: false, message: "Invalid id" });

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
    const landlordId = req.userId;

    if (!landlordId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    if (!mongoose.Types.ObjectId.isValid(id as string))
      return res.status(400).json({ success: false, message: "Invalid id" });

    const room = await RoomService.deleteRoom(id as string, landlordId);

    if (!room)
      return res.status(404).json({ success: false, message: "Not found" });

    return res.json({ success: true, message: "Deleted successfully" });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PUBLISH ROOM
 */
export const publishRoom = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const landlordId = req.userId;

    if (!landlordId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    if (!mongoose.Types.ObjectId.isValid(id as string))
      return res.status(400).json({ success: false, message: "Invalid id" });

    const room = await RoomService.publishRoom(id as string, landlordId);

    if (!room)
      return res.status(404).json({ success: false, message: "Not found" });

    return res.json({
      success: true,
      message: "Room published successfully",
      data: room,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * UNPUBLISH ROOM
 */
export const unpublishRoom = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const landlordId = req.userId;

    if (!landlordId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    if (!mongoose.Types.ObjectId.isValid(id as string))
      return res.status(400).json({ success: false, message: "Invalid id" });

    const room = await RoomService.unpublishRoom(id as string, landlordId);

    if (!room)
      return res.status(404).json({ success: false, message: "Not found" });

    return res.json({
      success: true,
      message: "Room unpublished successfully",
      data: room,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * UPLOAD ROOM IMAGE
 */
export const uploadRoomImage = async (req: Request, res: Response) => {
  try {
    const { id: roomId } = req.params;
    const landlordId = req.userId;

    if (!landlordId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    if (!mongoose.Types.ObjectId.isValid(roomId as string))
      return res.status(400).json({ success: false, message: "Invalid room id" });

    // Verify room exists and belongs to landlord
    const room = await RoomService.getRoomById(roomId as string, landlordId);
    if (!room)
      return res.status(404).json({ success: false, message: "Room not found" });

    const file = req.file;
    const { caption, order, isPrimary } = req.body;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Image file is required",
      });
    }

    const uploadedImage = await uploadBufferToCloudinary(file, roomId as string);

    const image = await RoomService.uploadRoomImage(roomId as string, {
      url: uploadedImage.secure_url,
      publicId: uploadedImage.public_id,
      caption,
      order: Number(order || 0),
      isPrimary: isPrimary === "true" || isPrimary === true,
    });

    return res.status(201).json({
      success: true,
      message: "Image uploaded successfully",
      data: image,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET ROOM IMAGES
 */
export const getRoomImages = async (req: Request, res: Response) => {
  try {
    const { id: roomId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(roomId as string))
      return res.status(400).json({ success: false, message: "Invalid room id" });

    const images = await RoomService.getRoomImages(roomId as string);

    return res.json({
      success: true,
      data: images,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * DELETE ROOM IMAGE
 */
export const deleteRoomImage = async (req: Request, res: Response) => {
  try {
    const { id: roomId, imageId } = req.params;
    const landlordId = req.userId;

    if (!landlordId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    if (!mongoose.Types.ObjectId.isValid(roomId as string))
      return res.status(400).json({ success: false, message: "Invalid room id" });

    if (!mongoose.Types.ObjectId.isValid(imageId as string))
      return res.status(400).json({ success: false, message: "Invalid image id" });

    // Verify room exists and belongs to landlord
    const room = await RoomService.getRoomById(roomId as string, landlordId);
    if (!room)
      return res.status(404).json({ success: false, message: "Room not found" });

    const image = await RoomService.deleteRoomImage(
      imageId as string,
      roomId as string
    );

    if (!image)
      return res.status(404).json({ success: false, message: "Image not found" });

    if (image.publicId) {
      try {
        const cloudinary = configureCloudinary();
        await cloudinary.uploader.destroy(image.publicId);
      } catch (cloudinaryError) {
        console.error("Failed to delete Cloudinary image:", cloudinaryError);
      }
    }

    return res.json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * SET PRIMARY IMAGE
 */
export const setPrimaryImage = async (req: Request, res: Response) => {
  try {
    const { id: roomId, imageId } = req.params;
    const landlordId = req.userId;

    if (!landlordId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    if (!mongoose.Types.ObjectId.isValid(roomId as string))
      return res.status(400).json({ success: false, message: "Invalid room id" });

    if (!mongoose.Types.ObjectId.isValid(imageId as string))
      return res.status(400).json({ success: false, message: "Invalid image id" });

    // Verify room exists and belongs to landlord
    const room = await RoomService.getRoomById(roomId as string, landlordId);
    if (!room)
      return res.status(404).json({ success: false, message: "Room not found" });

    const image = await RoomService.setPrimaryImage(
      imageId as string,
      roomId as string
    );

    if (!image)
      return res.status(404).json({ success: false, message: "Image not found" });

    return res.json({
      success: true,
      message: "Primary image set successfully",
      data: image,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
