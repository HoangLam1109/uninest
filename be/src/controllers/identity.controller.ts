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
 * Tạo hồ sơ định danh (kèm ảnh CCCD upload lên Cloudinary).
 * Có thể tạo cho chính mình hoặc cho người khác (targetUserId).
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

    const { fullName, dateOfBirth, phone, cccdNumber, targetUserId } = req.body;

    if (!fullName || !dateOfBirth || !phone || !cccdNumber) {
      return res.status(400).json({
        success: false,
        message: "All fields are required: fullName, dateOfBirth, phone, cccdNumber",
      });
    }

    // Nếu có targetUserId thì tạo identity cho người đó, ngược lại tạo cho chính mình
    const identityOwnerId = targetUserId || userId;

    // Upload both CCCD images to Cloudinary
    const [frontResult, backResult] = await Promise.all([
      uploadToCloudinary(frontFile, identityOwnerId, "front"),
      uploadToCloudinary(backFile, identityOwnerId, "back"),
    ]);

    const identity = await IdentityService.createIdentity(identityOwnerId, {
      fullName,
      dateOfBirth: new Date(dateOfBirth),
      phone,
      cccdNumber,
      cccdFrontImage: frontResult.secure_url,
      cccdBackImage: backResult.secure_url,
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

export const getAdminIdentities = async (req: Request, res: Response) => {
  try {
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const identities = await IdentityService.getIdentitiesForAdmin(status);
    return res.json({ success: true, data: identities });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const verifyIdentityByAdmin = async (req: Request, res: Response) => {
  try {
    const adminId = req.userId;
    const id = req.params.id as string;

    if (!adminId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ success: false, message: "Invalid identity id" });

    const identity = await IdentityService.verifyIdentity(id, adminId);
    return res.json({
      success: true,
      message: "Identity verified successfully",
      data: identity,
    });
  } catch (err: any) {
    const statusCode = err.message.includes("not found") ? 404 : 400;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
};

export const rejectIdentityByAdmin = async (req: Request, res: Response) => {
  try {
    const adminId = req.userId;
    const id = req.params.id as string;

    if (!adminId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ success: false, message: "Invalid identity id" });

    const identity = await IdentityService.rejectIdentity(id, adminId);
    return res.json({
      success: true,
      message: "Identity rejected successfully",
      data: identity,
    });
  } catch (err: any) {
    const statusCode = err.message.includes("not found") ? 404 : 400;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/identities/by-user/:userId
 * Lấy danh sách hồ sơ định danh của một người dùng cụ thể.
 * Dùng khi landlord/staff tạo booking cho tenant.
 */
export const getIdentitiesByUserId = async (req: Request, res: Response) => {
  try {
    const requesterId = req.userId;
    if (!requesterId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const targetUserId = req.params.userId as string;
    if (!mongoose.Types.ObjectId.isValid(targetUserId))
      return res.status(400).json({ success: false, message: "Invalid user id" });

    const identities = await IdentityService.getMyIdentities(targetUserId);
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
    const { fullName, dateOfBirth, phone } = req.body;

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

/**
 * GET /api/identities/search?cccd=XXXX
 * Tìm kiếm hồ sơ định danh bằng số CCCD (dùng khi tạo booking để thêm người thuê cùng)
 */
export const searchIdentityByCccd = async (req: Request, res: Response) => {
  try {
    const cccd = req.query.cccd as string;
    if (!cccd) {
      return res.status(400).json({ success: false, message: "Thiếu số CCCD" });
    }

    const identity = await IdentityService.searchByCccd(cccd);
    return res.json({ success: true, data: identity });
  } catch (err: any) {
    const statusCode = err.message.includes("Không tìm thấy") ? 404 : 500;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
};
