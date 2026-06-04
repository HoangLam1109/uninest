import type { Request, Response } from "express";
import { UserService } from "../services/user.service.js";

const userService = new UserService();

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
