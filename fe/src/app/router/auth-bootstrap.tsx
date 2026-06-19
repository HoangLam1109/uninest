import type { ReactNode } from 'react'
import { Loading } from '@/components/common/loading'
import { useAuthSession } from '@/features/auth/hooks/use-auth-session'
import { useAuthStore } from '@/stores/auth.store'

export function AuthBootstrap({ children }: { children: ReactNode }) {
  const accessToken = useAuthStore((s) => s.accessToken)
  const { isPending, isFetching } = useAuthSession()

  if (accessToken && (isPending || isFetching)) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Loading label="Đang tải phiên đăng nhập..." />
      </div>
    )
  }

  return children
}
