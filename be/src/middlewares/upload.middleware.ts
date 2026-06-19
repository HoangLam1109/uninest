import type { NextFunction, Request, Response } from "express";
import multer from "multer";

export const uploadImageMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 8 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      callback(new Error("Only image files are allowed"));
      return;
    }

    callback(null, true);
  },
});

export const uploadSingleImage = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  uploadImageMiddleware.single("image")(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError) {
      res.status(400).json({
        success: false,
        message:
          error.code === "LIMIT_FILE_SIZE"
            ? "Image file must be 8MB or smaller"
            : error.message,
      });
      return;
    }

    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Invalid image upload",
    });
  });
};

export const uploadRoomImages = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  uploadImageMiddleware.array("images", 12)(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError) {
      res.status(400).json({
        success: false,
        message:
          error.code === "LIMIT_FILE_SIZE"
            ? "Each image file must be 8MB or smaller"
            : error.message,
      });
      return;
    }

    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Invalid image upload",
    });
  });
};
