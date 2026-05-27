import type { Request, Response } from "express";
import { UserService } from "../services/user.service.js";
import type { IUser } from "../models/User.model.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { errorHandler } from "../utils/error.utils.js";
import { clearJWT, generateJWT, refreshJWT } from "../utils/jwt.utils.js";
dotenv.config();

const userService = new UserService();

const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      email,
      fullName,
      password,
    } = req.body;

    if (
      !email ||
      !fullName ||
      !password
    ) {
      res.status(400).json({ message: "Missing required fields!" });
      return;
    }

    const existingEmail = await userService.getUserByEmail(email);

    if (existingEmail) {
      res.status(400).json({
        message: existingEmail
          ? "Email already exists!"
          : "Identity number already exists!",
      });
      return;
    }

    await userService.createUser(
      {
        email,
        fullName,
        password: password
      },
      undefined
    );

    res.status(200).json({
      message: "User created successfully!",
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Missing credentials" });
      return;
    }

    const user: IUser | null = await userService.getUserByEmail(email);

    if (!user) {
      res.status(400).json({ message: "User not found!" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: "Invalid password!" });
      return;
    }

    const tokens = await generateJWT(res, user._id.toString());

    res.status(200).json({
      message: "Login successful!",
      accessToken: tokens?.accessToken,
      refreshToken: tokens?.refreshToken,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

const logoutUser = async (req: Request, res: Response): Promise<void> => {
  try {
    clearJWT(res);

    res.status(200).json({ message: "Logout successful!" });
  } catch (error) {
    errorHandler(res, error);
  }
};

const refreshToken = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided" });
    }

    // Generate new access token
    refreshJWT(res, userId);

    return res.status(200).json({ message: "Refresh token successful!" });
  } catch (error) {
    console.error("Refresh Token failed:", error);
    return res.status(500).json({ message: "Failed to refresh token" });
  }
};

export { registerUser, loginUser, logoutUser, refreshToken };
