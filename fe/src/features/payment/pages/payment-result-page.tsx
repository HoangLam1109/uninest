import { useEffect, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { paths } from '@/config/constants'
import { getDashboardPathForRole } from '@/constants/roles'
import { authApi } from '@/features/auth/api/auth.api'
import { authSessionQueryKey } from '@/features/auth/hooks/use-auth-session'
import { useAuthStore } from '@/stores/auth.store'
import { paymentApi } from '../api/payment.api'

type PaymentResultPageProps = {
  result: 'success' | 'cancel'
}

export function PaymentResultPage({ result }: PaymentResultPageProps) {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const setUser = useAuthStore((state) => state.setUser)
  const user = useAuthStore((state) => state.user)
  const orderCode = searchParams.get('orderCode')

  const statusQuery = useQuery({
    queryKey: ['payos', result, orderCode],
    enabled: Boolean(orderCode),
    retry: result === 'success' ? 3 : false,
    retryDelay: 1500,
    queryFn: async () => {
      const request =
        result === 'cancel'
          ? paymentApi.cancelPayOSPayment(orderCode!)
          : paymentApi.getPayOSPaymentStatus(orderCode!)
      const { data } = await request
      return data.data
    },
  })

  const isPaid = statusQuery.data?.payment.status === 'COMPLETED'
  const isCancelled = statusQuery.data?.payment.status === 'CANCELLED'

  useEffect(() => {
    if (!isPaid) return

    let cancelled = false

    async function refreshUser() {
      const { data } = await authApi.getMe()
      if (cancelled) return

      const nextUser = data.data.user
      setUser(nextUser)
      queryClient.setQueryData(authSessionQueryKey, nextUser)

      window.setTimeout(() => {
        navigate(getDashboardPathForRole(nextUser.role), { replace: true })
      }, 1200)
    }

    refreshUser().catch(() => {
      queryClient.invalidateQueries({ queryKey: authSessionQueryKey })
    })

    return () => {
      cancelled = true
    }
  }, [isPaid, navigate, queryClient, setUser])

  const view = useMemo(() => {
    if (!orderCode) {
      return {
        icon: <XCircle className="size-12 text-red-500" />,
        title: 'Thieu ma giao dich',
        description: 'Khong tim thay orderCode tu PayOS de xac minh thanh toan.',
      }
    }

    if (statusQuery.isPending || statusQuery.isFetching) {
      return {
        icon: <Loader2 className="size-12 animate-spin text-primary" />,
        title: result === 'cancel' ? 'Dang huy thanh toan' : 'Dang xac minh thanh toan',
        description: 'UniNest dang dong bo trang thai giao dich voi PayOS.',
      }
    }

    if (isPaid) {
      return {
        icon: <CheckCircle2 className="size-12 text-emerald-500" />,
        title: 'Thanh toán thành công',
        description: 'Tài khoản của bạn đã được nâng cấp. Bạn sẽ được chuyển tới dashboard trong giây lát.',
      }
    }

    if (result === 'cancel' || isCancelled) {
      return {
        icon: <XCircle className="size-12 text-red-500" />,
        title: 'Thanh toán bị hủy',
        description: 'Giao dịch đã được ghi nhận là hủy. Bạn có thể quay lại trang chủ để chọn lại gói.',
      }
    }

    return {
      icon: <XCircle className="size-12 text-red-500" />,
      title: 'Chưa xác nhận được thanh toán',
      description: 'PayOS chưa trả trạng thái đã thanh toán cho giao dịch này. Vui lòng thử lại sau ít phút.',
    }
  }, [
    isCancelled,
    isPaid,
    orderCode,
    result,
    statusQuery.isFetching,
    statusQuery.isPending,
  ])

  return (
    <main className="flex min-h-svh items-center justify-center bg-surface px-4 py-10">
      <section className="w-full max-w-md rounded-xl border border-primary/10 bg-white p-6 text-center shadow-sm">
        <div className="mx-auto flex justify-center">{view.icon}</div>
        <h1 className="mt-4 text-2xl font-black text-foreground">{view.title}</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{view.description}</p>

        {orderCode ? (
          <p className="mt-4 rounded-lg bg-surface px-3 py-2 text-xs font-semibold text-muted-foreground">
            Ma giao dich: {orderCode}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link to={getDashboardPathForRole(user?.role)}>Vào dashboard</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to={paths.home}>Về trang chủ</Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
