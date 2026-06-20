import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

export type AppEnv = "local" | "production";

function normalizeAppEnv(value: string | undefined): AppEnv {
  const normalizedValue = value?.trim().toLowerCase();

  if (
    normalizedValue === "production" ||
    normalizedValue === "prod"
  ) {
    return "production";
  }

  return "local";
}

export const appEnv = normalizeAppEnv(process.env.APP_ENV ?? process.env.NODE_ENV);

const initialEnvKeys = new Set(Object.keys(process.env));
const envFileNames =
  appEnv === "production"
    ? [".env.production"]
    : [".env", ".env.local"];

for (const [index, fileName] of envFileNames.entries()) {
  const filePath = path.resolve(process.cwd(), fileName);

  if (!existsSync(filePath)) {
    continue;
  }

  const parsedEnv = dotenv.parse(readFileSync(filePath));
  const allowOverride = index > 0;

  for (const [key, value] of Object.entries(parsedEnv)) {
    if (!value) {
      continue;
    }

    if (initialEnvKeys.has(key)) {
      continue;
    }

    if (!allowOverride && process.env[key] !== undefined) {
      continue;
    }

    process.env[key] = value;
  }
}

if (!process.env.APP_ENV) {
  process.env.APP_ENV = appEnv;
}

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = appEnv === "production" ? "production" : "development";
}
