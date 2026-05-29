import { Navigate, Outlet } from 'react-router-dom'
import { Loading } from '@/components/common/loading'
import { getDashboardPathForRole, type UserRole } from '@/constants/roles'
import { useAuthSession } from '@/features/auth/hooks/use-auth-session'
import { useAuthStore } from '@/stores/auth.store'

type RoleRouteProps = {
  allowedRoles: UserRole[]
}

export function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const user = useAuthStore((s) => s.user)
  const { isPending, isFetching } = useAuthSession()

  if (isPending || isFetching) {
    return <Loading className="min-h-[40vh]" label="Đang xác minh quyền truy cập..." />
  }

  if (!user?.role || !allowedRoles.includes(user.role)) {
    return <Navigate to={getDashboardPathForRole(user?.role)} replace />
  }

  return <Outlet />
}
