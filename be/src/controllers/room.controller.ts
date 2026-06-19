import type { Request, Response } from "express";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import mongoose from "mongoose";
import { configureCloudinary } from "../config/cloudinary.config.js";
import { RoomService } from "../services/room.service.js";
import { UserService } from "../services/user.service.js";

function handleError(res: Response, err: any, context: string) {
  console.error(`[RoomController] ${context}:`, err.message ?? err);

  // Mongoose ValidationError
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors ?? {}).map((e: any) => e.message);
    return res.status(400).json({
      success: false,
      message: messages.length > 0 ? messages.join("; ") : err.message,
    });
  }

  // Mongoose CastError (invalid ObjectId, etc.)
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: `Invalid value for ${err.path}: ${err.value}`,
    });
  }

  return res.status(500).json({ success: false, message: err.message || "Internal server error" });
}

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

async function saveRoomImageLocally(
  file: Express.Multer.File,
  roomId: string,
  req: Request,
) {
  const extension = path.extname(file.originalname) || ".jpg";
  const fileName = `${randomUUID()}${extension.toLowerCase()}`;
  const relativeDir = path.join("uploads", "rooms", roomId);
  const absoluteDir = path.join(process.cwd(), relativeDir);

  await mkdir(absoluteDir, { recursive: true });
  await writeFile(path.join(absoluteDir, fileName), file.buffer);

  const publicPath = `/uploads/rooms/${roomId}/${fileName}`;
  return {
    secure_url: `${req.protocol}://${req.get("host")}${publicPath}`,
  };
}

function parseMaybeJson(value: unknown) {
  if (typeof value !== "string") return value;
  const trimmedValue = value.trim();

  if (
    (trimmedValue.startsWith("[") && trimmedValue.endsWith("]")) ||
    (trimmedValue.startsWith("{") && trimmedValue.endsWith("}"))
  ) {
    try {
      return JSON.parse(trimmedValue);
    } catch {
      return value;
    }
  }

  return value;
}

function normalizeRoomCreateBody(body: Record<string, unknown>) {
  const normalizedBody: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(body)) {
    if (key === "imageCaptions" || key === "primaryImageIndex") continue;
    normalizedBody[key] = parseMaybeJson(value);
  }

  return normalizedBody;
}

async function persistRoomImage(
  file: Express.Multer.File,
  roomId: string,
  req: Request,
  imageData: {
    caption?: string;
    order?: number;
    isPrimary?: boolean;
  },
) {
  let uploadedImage: { secure_url: string; public_id?: string };
  try {
    uploadedImage = await uploadBufferToCloudinary(file, roomId);
  } catch (cloudinaryError: any) {
    console.warn(
      "[RoomController] Cloudinary upload failed, saving room image locally:",
      cloudinaryError?.message ?? cloudinaryError,
    );
    uploadedImage = await saveRoomImageLocally(file, roomId, req);
  }

  return RoomService.uploadRoomImage(roomId, {
    url: uploadedImage.secure_url,
    publicId: uploadedImage.public_id,
    caption: imageData.caption,
    order: imageData.order ?? 0,
    isPrimary: imageData.isPrimary ?? false,
  });
}

/**
 * CREATE ROOM
 */
export const createRoom = async (req: Request, res: Response) => {
  try {
    const landlordId = req.userId;
    if (!landlordId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const room = await RoomService.createRoom(
      normalizeRoomCreateBody(req.body),
      landlordId
    );
    const roomId = room._id.toString();
    const files = Array.isArray(req.files)
      ? (req.files as Express.Multer.File[])
      : [];
    const parsedCaptions = parseMaybeJson(req.body.imageCaptions);
    const captions = Array.isArray(parsedCaptions) ? parsedCaptions : [];
    const primaryImageIndex = Number(req.body.primaryImageIndex ?? 0);
    const images =
      files.length > 0
        ? await Promise.all(
            files.map((file, index) => {
              const imageData: {
                caption?: string;
                order: number;
                isPrimary: boolean;
              } = {
                order: index,
                isPrimary: index === primaryImageIndex,
              };

              if (typeof captions[index] === "string") {
                imageData.caption = captions[index] as string;
              }

              return persistRoomImage(file, roomId, req, imageData);
            })
          )
        : [];

    return res.status(201).json({
      success: true,
      message: "Room created successfully",
      data: room,
      images,
    });
  } catch (err: any) {
    return handleError(res, err, "createRoom");
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
    return handleError(res, err, "getAllRooms");
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
    return handleError(res, err, "getMyRooms");
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
    return handleError(res, error, "getTenantListByLandlord");
  }
};

/**
 * SEARCH
 */
export const searchRooms = async (req: Request, res: Response) => {
  try {
    const {
      q,
      page = 1,
      limit = 10,
      status,
      minPrice,
      maxPrice,
      roomType,
    } = req.query;

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
    const filter: any = { ...keyword };

    if (status) filter.status = status;
    if (roomType) filter.roomType = roomType;
    if (minPrice || maxPrice) {
      filter.pricePerMonth = {};
      if (minPrice) filter.pricePerMonth.$gte = Number(minPrice);
      if (maxPrice) filter.pricePerMonth.$lte = Number(maxPrice);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const { rooms, total } = await RoomService.searchRooms(
      filter,
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
    return handleError(res, err, "searchRooms");
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
    return handleError(res, err, "getRoomById");
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
    return handleError(res, err, "updateRoom");
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
    return handleError(res, err, "deleteRoom");
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
    return handleError(res, err, "publishRoom");
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
    return handleError(res, err, "unpublishRoom");
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

    const image = await persistRoomImage(file, roomId as string, req, {
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
    return handleError(res, err, "uploadRoomImage");
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
    return handleError(res, err, "getRoomImages");
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
    return handleError(res, err, "deleteRoomImage");
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
    return handleError(res, err, "setPrimaryImage");
  }
};
