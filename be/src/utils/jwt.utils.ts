import jwt, { type SignOptions } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

export function createTokenPair(userId: string): TokenPair {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET_KEY as string,
    { expiresIn: process.env.JWT_EXPIRY } as SignOptions,
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET as string,
    { expiresIn: process.env.JWT_REFRESH_EXPIRY } as SignOptions,
  );

  return { accessToken, refreshToken };
}

export function createAccessToken(userId: string): string {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET_KEY as string,
    { expiresIn: process.env.JWT_EXPIRY } as SignOptions,
  );
}

export function verifyAccessToken(token: string): { userId: string } {
  return jwt.verify(token, process.env.JWT_SECRET_KEY as string) as {
    userId: string;
  };
}

export function verifyRefreshToken(token: string): { userId: string } {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET as string) as {
    userId: string;
  };
}
