import { getDashboardPathForRole } from '@/constants/roles'
import type { AuthUser } from '@/types/auth'

export function getPostAuthPath(user: AuthUser | null | undefined): string {
  return getDashboardPathForRole(user?.role)
}
