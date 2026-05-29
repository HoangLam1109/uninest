export const USER_ROLES = {
  ADMIN: "ADMIN",
  STAFF: "STAFF",
  LANDLORD: "LANDLORD",
  TENANT: "TENANT",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export function isValidUserRole(userRole: string): userRole is UserRole {
  return Object.values(USER_ROLES).includes(userRole as UserRole);
}
