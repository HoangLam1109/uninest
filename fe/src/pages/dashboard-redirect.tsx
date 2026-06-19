import { Navigate } from 'react-router-dom'
import { Loading } from '@/components/common/loading'
import { getDashboardPathForRole } from '@/constants/roles'
import { useAuthSession } from '@/features/auth/hooks/use-auth-session'
import { useAuthStore } from '@/stores/auth.store'
import { paths } from '@/config/constants'

export function DashboardRedirectPage() {
  const accessToken = useAuthStore((s) => s.accessToken)
  const user = useAuthStore((s) => s.user)
  const { isPending, isFetching } = useAuthSession()

  if (!accessToken) {
    return <Navigate to={paths.login} replace />
  }

  if (isPending || isFetching) {
    return <Loading className="min-h-svh" label="Đang chuyển hướng..." />
  }

  return <Navigate to={getDashboardPathForRole(user?.role)} replace />
}
