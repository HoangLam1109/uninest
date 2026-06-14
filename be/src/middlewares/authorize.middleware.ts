import type { Request, Response, NextFunction } from "express";
import { USER_ROLES } from "../constants/role.constant.js";

export const authorizeAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  if (req.user.role !== USER_ROLES.ADMIN) {
    return res.status(403).json({
      success: false,
      message: "Forbidden. Admin access required.",
    });
  }

  next();
};

export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Required roles: ${roles.join(", ")}`,
      });
    }

    next();
  };
};