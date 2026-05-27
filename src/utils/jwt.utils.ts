import type { Response } from "express";
import jwt, { type SignOptions } from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

async function generateJWT(res: Response, userId: string): Promise<{ accessToken: string; refreshToken: string } | null> {
  const accessToken = jwt.sign(
    { userId: userId },
    process.env.JWT_SECRET_KEY as string,
    { expiresIn: process.env.JWT_EXPIRY } as SignOptions,
  );
  const refreshToken = jwt.sign(
    { userId: userId },
    process.env.JWT_REFRESH_SECRET as string,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRY,
    } as SignOptions,
  );

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV?.toLowerCase() === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000,
    path: "/",
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV?.toLowerCase() === "production",
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: "strict",
  });
  
  return { accessToken, refreshToken };
};

const refreshJWT = (res: Response, userId: string) => {
  const newAccessToken = jwt.sign(
    { userId: userId },
    process.env.JWT_SECRET_KEY as string,
    {
      expiresIn: process.env.JWT_EXPIRY,
    } as SignOptions,
  );

  res.cookie("accessToken", newAccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV?.toLowerCase() === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000,
    path: "/",
  });
};

const clearJWT = (res: Response) => {
  res.cookie("accessToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV?.toLowerCase() === "production",
    sameSite: "strict",
    expires: new Date(0),
    path: "/",
  });
};

export { generateJWT, clearJWT, refreshJWT };
