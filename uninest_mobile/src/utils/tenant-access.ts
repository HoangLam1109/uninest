import { getApiErrorMessage } from "@/lib/api-error";

export function isTenantUser(role?: string | null): boolean {
  return role === "TENANT";
}

export function isGuestUser(role?: string | null): boolean {
  return !role || role === "GUEST";
}

export function isLandlordUser(role?: string | null): boolean {
  return role === "LANDLORD" || role === "ADMIN";
}

export function isUpgradeRequiredError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("only tenants") ||
    lower.includes("required roles: tenant") ||
    (lower.includes("forbidden") && lower.includes("tenant"))
  );
}

export function shouldPromptTenantUpgrade(
  role: string | null | undefined,
  error: unknown,
): boolean {
  if (!isGuestUser(role)) return false;
  const message = getApiErrorMessage(error, "");
  return isUpgradeRequiredError(message);
}
