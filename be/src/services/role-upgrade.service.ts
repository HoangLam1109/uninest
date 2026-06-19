import { USER_ROLES, type UserRole } from "../constants/role.constant.js";
import { userRepository } from "../repositories/index.js";

export const ROLE_UPGRADE_NOTE_PREFIX = "ROLE_UPGRADE:";

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

export async function applyRoleUpgradeFromPayment(payment: any) {
  const targetRole = getRoleUpgradeTarget(payment.note);
  if (!targetRole) return null;

  return userRepository.updateById(payment.payerId.toString(), {
    role: targetRole,
  });
}
