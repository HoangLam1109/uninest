import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import { extractBearerToken } from "../utils/auth.utils.js";
import { verifyAccessToken, verifyRefreshToken } from "../utils/jwt.utils.js";

declare global {
  namespace Express {
    interface Request {
      user?: any;
      userId?: string;
    }
  }
}

const refreshTokenValidation = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const refreshToken =
    typeof req.body?.refreshToken === "string"
      ? req.body.refreshToken
      : null;

  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error("Refresh token validation failed:", error);
    return res.status(401).json({ message: "Invalid or expired refresh token" });
  }
};

const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = extractBearerToken(req);

    if (!token) {
      res.status(401).json({ message: "Not authorized, no token" });
      return;
    }

    if (!process.env.JWT_SECRET_KEY) {
      res.status(500).json({ message: "JWT secret is not defined" });
      return;
    }

    const decoded = verifyAccessToken(token);

    const user = await User.findById(
      decoded.userId,
      "_id email fullName phone identityNumber gender age dateOfBirth role",
    );

    if (!user) {
      res.status(401).json({ message: "Not authorized, user not found" });
      return;
    }

    req.user = user;
    req.userId = decoded.userId;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: "Token expired" });
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: "Invalid token" });
      return;
    }

    console.error("Authentication error:", error);
    res.status(500).json({ message: "Server error during authentication" });
  }
};

export default {
  authenticateUser,
  refreshTokenValidation,
};
