import type { Request, Response } from "express";
import { UserService } from "../services/user.service.js";
import type { IUser } from "../models/User.model.js";
import bcrypt from "bcryptjs";
import "../config/env.js";
import { errorHandler } from "../utils/error.utils.js";
import { createAccessToken, createTokenPair } from "../utils/jwt.utils.js";
import { expireRoleUpgradeIfNeeded } from "../services/role-upgrade.service.js";
import {
  normalizeEmail,
  OtpRateLimitError,
} from "../services/email-otp.service.js";
import { RegisterOtpService } from "../services/register-otp.service.js";
import { ResetPasswordOtpService } from "../services/reset-password-otp.service.js";

const userService = new UserService();
const registerOtpService = new RegisterOtpService();
const resetPasswordOtpService = new ResetPasswordOtpService();

function toAuthUser(user: IUser) {
  return {
    id: String(user._id),
    email: user.email,
    fullName: user.fullName,
    phone: user.phone,
    role: user.role,
    roleExpiresAt: user.roleExpiresAt,
    avatarUrl: user.avatarUrl,
  };
}

const sendRegisterOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const email = normalizeEmail(req.body.email ?? "");

    if (!email) {
      res.status(400).json({ message: "Email is required!" });
      return;
    }

    const existingEmail = await userService.getUserByEmail(email);

    if (existingEmail) {
      res.status(400).json({ message: "Email already exists!" });
      return;
    }

    await registerOtpService.sendOtp(email);

    res.status(200).json({
      message: "OTP sent successfully!",
    });
  } catch (error) {
    if (error instanceof OtpRateLimitError) {
      res.status(429).json({ message: error.message });
      return;
    }

    errorHandler(res, error);
  }
};

const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const email = normalizeEmail(req.body.email ?? "");
    const { fullName, password, phone, otp } = req.body;

    if (!email || !fullName || !password || !phone || !otp) {
      res.status(400).json({ message: "Missing required fields!" });
      return;
    }

    const existingEmail = await userService.getUserByEmail(email);

    if (existingEmail) {
      res.status(400).json({ message: "Email already exists!" });
      return;
    }

    if (!(await registerOtpService.verifyOtp(email, otp))) {
      res.status(400).json({ message: "Invalid or expired OTP!" });
      return;
    }

    await userService.createUser(
      {
        email,
        fullName,
        password,
        phone,
      },
      undefined,
    );

    res.status(201).json({
      message: "User created successfully!",
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const email = normalizeEmail(req.body.email ?? "");
    const { password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Missing credentials" });
      return;
    }

    const user = await userService.getUserByEmail(email);

    if (!user) {
      res.status(400).json({ message: "User not found!" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: "Invalid password!" });
      return;
    }

    const activeUser = await expireRoleUpgradeIfNeeded(user);

    const tokens = createTokenPair(activeUser._id.toString());

    res.status(200).json({
      message: "Login successful!",
      data: {
        user: toAuthUser(activeUser),
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const email = normalizeEmail(req.body.email ?? "");

    if (!email) {
      res.status(400).json({ message: "Email is required!" });
      return;
    }

    const existingUser = await userService.getUserByEmail(email);

    if (existingUser) {
      await resetPasswordOtpService.sendOtp(email);
    }

    res.status(200).json({
      message: "Nếu email tồn tại trong hệ thống, chúng tôi đã gửi mã xác nhận.",
    });
  } catch (error) {
    if (error instanceof OtpRateLimitError) {
      res.status(429).json({ message: error.message });
      return;
    }

    errorHandler(res, error);
  }
};

const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const email = normalizeEmail(req.body.email ?? "");
    const otp = typeof req.body.otp === "string" ? req.body.otp.trim() : "";
    const newPassword =
      typeof req.body.newPassword === "string" ? req.body.newPassword : "";

    if (!email || !otp || !newPassword) {
      res.status(400).json({ message: "Missing required fields!" });
      return;
    }

    const existingUser = await userService.getUserByEmail(email);

    if (!existingUser) {
      res.status(400).json({ message: "Invalid or expired OTP!" });
      return;
    }

    const isValidOtp = await resetPasswordOtpService.verifyOtp(email, otp);

    if (!isValidOtp) {
      res.status(400).json({ message: "Invalid or expired OTP!" });
      return;
    }

    await userService.updateUser(String(existingUser._id), {
      password: newPassword,
    });

    res.status(200).json({
      message: "Password reset successfully!",
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

const logoutUser = async (req: Request, res: Response): Promise<void> => {
  try {
    // Stateless JWT: client drops tokens. Add server-side refresh revocation later if needed.
    res.status(200).json({ message: "Logout successful!" });
  } catch (error) {
    errorHandler(res, error);
  }
};

const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    res.status(200).json({
      message: "User fetched successfully!",
      data: {
        user: toAuthUser(req.user as IUser),
      },
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const accessToken = createAccessToken(userId);

    res.status(200).json({
      message: "Token refreshed successfully!",
      data: {
        accessToken,
      },
    });
  } catch (error) {
    console.error("Refresh token failed:", error);
    res.status(500).json({ message: "Failed to refresh token" });
  }
};

export {
  sendRegisterOtp,
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  logoutUser,
  getMe,
  refreshToken,
};
