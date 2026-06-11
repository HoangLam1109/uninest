import { getDashboardPathForRole } from '@/constants/roles'
import { paths } from '@/config/constants'
import { USER_ROLES } from '@/constants/roles'
import type { AuthUser } from '@/types/auth'

export function getPostAuthPath(user: AuthUser | null | undefined): string {
  // Tenant goes to home page instead of dashboard
  if (user?.role === USER_ROLES.TENANT) {
    return paths.home
  }
  return getDashboardPathForRole(user?.role)
}
