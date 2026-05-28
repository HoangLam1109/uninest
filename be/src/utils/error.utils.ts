import type { Response } from "express";

export const errorHandler = (res: Response, error: any) => {
  console.error("Error details:", error);
  res.status(500).json({
    message: "Server Error!",
    error: error.message,
  });
};
