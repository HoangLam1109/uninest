import type { Request, Response } from "express";
import mongoose from "mongoose";
import { IdentityService } from "../services/identity.service.js";
import { configureCloudinary } from "../config/cloudinary.config.js";

function uploadToCloudinary(
  file: Express.Multer.File,
  userId: string,
  side: "front" | "back"
) {
  const cloudinary = configureCloudinary();

  return new Promise<{ secure_url: string; public_id: string }>(
    (resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `uninest/identities/${userId}`,
          public_id: `cccd_${side}_${Date.now()}`,
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
        }
      );
      uploadStream.end(file.buffer);
    }
  );
}

/**
 * POST /api/identities
 * Tenant tạo hồ sơ định danh (kèm ảnh CCCD upload lên Cloudinary)
 */
export const createIdentity = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const frontFile = files?.cccdFront?.[0];
    const backFile = files?.cccdBack?.[0];

    if (!frontFile || !backFile) {
      return res.status(400).json({
        success: false,
        message: "Both CCCD front and back images are required",
      });
    }

    const { fullName, dateOfBirth, phone, cccdNumber, coTenants } = req.body;

    if (!fullName || !dateOfBirth || !phone || !cccdNumber) {
      return res.status(400).json({
        success: false,
        message: "All fields are required: fullName, dateOfBirth, phone, cccdNumber",
      });
    }

    // Upload both CCCD images to Cloudinary
    const [frontResult, backResult] = await Promise.all([
      uploadToCloudinary(frontFile, userId, "front"),
      uploadToCloudinary(backFile, userId, "back"),
    ]);

    const identity = await IdentityService.createIdentity(userId, {
      fullName,
      dateOfBirth: new Date(dateOfBirth),
      phone,
      cccdNumber,
      cccdFrontImage: frontResult.secure_url,
      cccdBackImage: backResult.secure_url,
      coTenants: coTenants ? (typeof coTenants === "string" ? JSON.parse(coTenants) : coTenants) : [],
    });

    return res.status(201).json({
      success: true,
      message: "Identity profile created successfully",
      data: identity,
    });
  } catch (err: any) {
    const statusCode = err.message.includes("already registered") ? 409 : 400;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/identities/:id
 * Xem chi tiết hồ sơ định danh
 */
export const getIdentityById = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const id = req.params.id as string;

    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ success: false, message: "Invalid identity id" });

    const identity = await IdentityService.getIdentityById(id, userId);
    return res.json({ success: true, data: identity });
  } catch (err: any) {
    const statusCode = err.message.includes("not found") ? 404 : 403;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/identities/my
 * Tenant xem danh sách hồ sơ của mình
 */
export const getMyIdentities = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const identities = await IdentityService.getMyIdentities(userId);
    return res.json({ success: true, data: identities });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PUT /api/identities/:id
 * Tenant cập nhật hồ sơ (chỉ khi chưa verified, có thể gửi ảnh CCCD mới)
 */
export const updateIdentity = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const id = req.params.id as string;

    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ success: false, message: "Invalid identity id" });

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const { fullName, dateOfBirth, phone, coTenants } = req.body;

    const updateData: any = {};
    if (fullName) updateData.fullName = fullName;
    if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth);
    if (phone) updateData.phone = phone;

    // Upload new CCCD images to Cloudinary if provided
    if (files?.cccdFront?.[0]) {
      const result = await uploadToCloudinary(files.cccdFront[0], userId, "front");
      updateData.cccdFrontImage = result.secure_url;
    }
    if (files?.cccdBack?.[0]) {
      const result = await uploadToCloudinary(files.cccdBack[0], userId, "back");
      updateData.cccdBackImage = result.secure_url;
    }
    if (coTenants) {
      updateData.coTenants = typeof coTenants === "string" ? JSON.parse(coTenants) : coTenants;
    }

    const identity = await IdentityService.updateIdentity(id, userId, updateData);
    return res.json({
      success: true,
      message: "Identity updated successfully",
      data: identity,
    });
  } catch (err: any) {
    const statusCode = err.message.includes("not found") ? 404
      : err.message.includes("do not own") ? 403
      : err.message.includes("verified or rejected") ? 400
      : 500;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
};
