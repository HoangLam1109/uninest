import { USER_ROLES, type UserRole } from "../constants/role.constant.js";
import { userRepository } from "../repositories/index.js";

export const ROLE_UPGRADE_NOTE_PREFIX = "ROLE_UPGRADE:";
export const ROLE_UPGRADE_DURATION_MONTHS = 1;

export const ROLE_UPGRADE_PRICES = {
  [USER_ROLES.TENANT]: 2_000,
  [USER_ROLES.LANDLORD]: 3_000,
} as const;

export type PaidUpgradeRole = keyof typeof ROLE_UPGRADE_PRICES;

export function isPaidUpgradeRole(role: UserRole): role is PaidUpgradeRole {
  return role === USER_ROLES.TENANT || role === USER_ROLES.LANDLORD;
}

export function buildRoleUpgradeNote(targetRole: PaidUpgradeRole) {
  return `${ROLE_UPGRADE_NOTE_PREFIX}${targetRole}`;
}

export function getRoleUpgradeTarget(note?: string | null) {
  if (!note?.startsWith(ROLE_UPGRADE_NOTE_PREFIX)) return null;

  const targetRole = note.slice(ROLE_UPGRADE_NOTE_PREFIX.length).trim() as UserRole;
  return isPaidUpgradeRole(targetRole) ? targetRole : null;
}

export function getRoleUpgradeExpiresAt(from = new Date()) {
  const expiresAt = new Date(from);
  expiresAt.setMonth(expiresAt.getMonth() + ROLE_UPGRADE_DURATION_MONTHS);
  return expiresAt;
}

export async function expireRoleUpgradeIfNeeded(user: any) {
  if (!user?.roleExpiresAt) return user;

  const expiresAt = new Date(user.roleExpiresAt);
  if (Number.isNaN(expiresAt.getTime()) || expiresAt > new Date()) {
    return user;
  }

  const updated = await userRepository.updateById(user._id.toString(), {
    role: USER_ROLES.GUEST,
    roleExpiresAt: null,
  });

  return updated || user;
}

export async function applyRoleUpgradeFromPayment(payment: any) {
  const targetRole = getRoleUpgradeTarget(payment.note);
  if (!targetRole) return null;

  const roleExpiresAt = getRoleUpgradeExpiresAt();

  return userRepository.updateById(payment.payerId.toString(), {
    role: targetRole,
    roleExpiresAt,
  });
}
