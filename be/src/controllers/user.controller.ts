import type { Request, Response } from "express";
import { UserService } from "../services/user.service.js";
import { configureCloudinary } from "../config/cloudinary.config.js";

const userService = new UserService();

function uploadAvatarToCloudinary(file: Express.Multer.File, userId: string) {
  const cloudinary = configureCloudinary();

  return new Promise<{ secure_url: string; public_id: string }>(
    (resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `uninest/avatars/${userId}`,
          public_id: `avatar_${Date.now()}`,
          resource_type: "image",
          transformation: [
            { width: 400, height: 400, crop: "fill", gravity: "face" },
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

export const uploadAvatar = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const file = req.file;
    if (!file)
      return res.status(400).json({ success: false, message: "No image file provided" });

    const { secure_url } = await uploadAvatarToCloudinary(file, userId);

    const updatedUser = await userService.updateUserProfile(userId, {
      avatarUrl: secure_url,
    });

    return res.json({
      success: true,
      message: "Avatar uploaded successfully",
      data: {
        avatarUrl: secure_url,
        user: updatedUser,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });
    const user = await userService.getUserProfile(userId);
    return res.json({ success: true, data: user });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });
    const updatedUser = await userService.updateUserProfile(userId, req.body);
    if (!updatedUser)
      return res.status(404).json({ success: false, message: "User not found" });
    return res.json({ success: true, data: updatedUser });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });
    const deletedUser = await userService.deleteUser(userId);
    if (!deletedUser)
      return res.status(404).json({ success: false, message: "User not found" });
    return res.json({
      success: true,
      message: "User profile deleted successfully",
      data: deletedUser,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getUserByEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    const user = await userService.getUserByEmail(email as string);
    return res.json({ success: true, data: user });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getUserByFullName = async (req: Request, res: Response) => {
  try {
    const { fullName } = req.params;
    const user = await userService.getUserByFullName(fullName as string);
    return res.json({ success: true, data: user });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getUserByPhone = async (req: Request, res: Response) => {
  try {
    const { phone } = req.params;
    const user = await userService.getUserByPhone(phone as string);
    return res.json({ success: true, data: user });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers();
    return res.json({ success: true, data: users });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const performedBy = req.userId;
    const user = await userService.createUser(req.body, performedBy);
    return res.status(201).json({ success: true, data: user });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id: userId } = req.params;
    const performedBy = req.userId;
    const updatedUser = await userService.updateUser(userId as string, req.body, performedBy);
    if (!updatedUser)
      return res.status(404).json({ success: false, message: "User not found" });
    return res.json({ success: true, data: updatedUser });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id: userId } = req.params;
    const deletedUser = await userService.deleteUser(userId as string);
    if (!deletedUser)
      return res.status(404).json({ success: false, message: "User not found" });
    return res.json({
      success: true,
      message: "User deleted successfully",
      data: deletedUser,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id: userId } = req.params;
    const user = await userService.getUser(userId as string);
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });
    return res.json({ success: true, data: user });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/users/search?q=keyword
 * Tìm kiếm user theo tên, số điện thoại hoặc email
 */
export const searchUsers = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string' || q.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Thiếu từ khóa tìm kiếm' });
    }
    const users = await userService.searchUsers(q.trim());
    return res.json({ success: true, data: users });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
