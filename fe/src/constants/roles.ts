import { paths } from '@/config/constants'

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
  LANDLORD: 'LANDLORD',
  TENANT: 'TENANT',
  GUEST: 'GUEST',
} as const

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES]

const DASHBOARD_ROLES: UserRole[] = [
  USER_ROLES.LANDLORD,
  USER_ROLES.TENANT,
  USER_ROLES.ADMIN,
  USER_ROLES.STAFF,
]

export function isDashboardRole(role?: UserRole): role is UserRole {
  return Boolean(role && DASHBOARD_ROLES.includes(role))
}

export function getDashboardPathForRole(role?: UserRole): string {
  switch (role) {
    case USER_ROLES.LANDLORD:
      return paths.landlordDashboard
    case USER_ROLES.TENANT:
      return paths.tenantDashboard
    case USER_ROLES.ADMIN:
    case USER_ROLES.STAFF:
      return paths.adminDashboard
    default:
      return paths.home
  }
}

export function getDashboardLabelForRole(role?: UserRole): string | null {
  switch (role) {
    case USER_ROLES.LANDLORD:
      return 'Bảng điều khiển chủ nhà'
    case USER_ROLES.TENANT:
      return 'Trang người thuê'
    case USER_ROLES.ADMIN:
      return 'Trang quản trị'
    case USER_ROLES.STAFF:
      return 'Trang nhân viên'
    default:
      return null
  }
}
