import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Check,
  Crown,
  ShieldCheck,
  Sparkles,
  X,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Modal } from '@/components/ui/modal'
import { paths } from '@/config/constants'
import { useAuth } from '@/hooks/use-auth'
import { servicePackageApi } from '../api/service-package.api'
import { serviceSubscriptionApi } from '../api/service-subscription.api'
import type { ServicePackage } from '../types/service-package.type'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)
}

export function UpgradePackageButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="border-white bg-white/90 text-foreground shadow-xl shadow-foreground/10 hover:bg-white"
        onClick={() => setOpen(true)}
      >
        <Crown className="size-5 text-primary" />
        Nâng cấp gói
      </Button>

      <UpgradePackageModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}

function UpgradePackageModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { isLoggedIn } = useAuth()

  const packagesQuery = useQuery({
    queryKey: ['active-service-packages'],
    queryFn: async () => {
      const { data } = await servicePackageApi.listActive({ limit: 50 })
      return data.data
    },
    enabled: open,
  })

  const servicePackages = packagesQuery.data ?? []

  return (
    <Modal
      open={open}
      onClose={onClose}
      className="max-h-[calc(100svh-2rem)] max-w-4xl overflow-y-auto p-0"
    >
      <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-4 sm:gap-4 sm:px-6">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-primary sm:text-xs sm:tracking-[0.14em]">
            UniNest Membership
          </p>
          <h2 className="mt-1 text-xl font-black leading-tight text-foreground sm:text-2xl">
            Chọn gói phù hợp với nhu cầu của bạn
          </h2>
        </div>
        <button
          type="button"
          className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
          aria-label="Đóng"
          onClick={onClose}
        >
          <X className="size-5" />
        </button>
      </div>

      {packagesQuery.isLoading ? (
        <div className="flex min-h-40 items-center justify-center gap-2 text-sm font-semibold text-slate-500">
          <Loader2 className="size-4 animate-spin text-primary" />
          Đang tải gói dịch vụ...
        </div>
      ) : (
        <div className="grid gap-4 p-4 md:grid-cols-2 sm:p-6">
          {servicePackages.map((pkg) => (
            <ServicePackageCard
              key={pkg._id}
              packageInfo={pkg}
              isLoggedIn={isLoggedIn}
              onClose={onClose}
            />
          ))}
        </div>
      )}
    </Modal>
  )
}

function ServicePackageCard({
  packageInfo,
  isLoggedIn,
  onClose,
}: {
  packageInfo: ServicePackage
  isLoggedIn: boolean
  onClose: () => void
}) {
  const navigate = useNavigate()
  const [subscribing, setSubscribing] = useState(false)

  const features = packageInfo.features
    ? Object.values(packageInfo.features)
    : ['Truy cập đầy đủ tính năng của gói']

  async function handleSubscribe() {
    if (!isLoggedIn) {
      toast.info('Vui lòng đăng nhập để đăng ký gói')
      navigate(paths.login)
      onClose()
      return
    }

    setSubscribing(true)
    try {
      const { data } = await serviceSubscriptionApi.subscribe(packageInfo._id, {
        method: 'PAYOS',
      })
      if (data.data?.checkoutUrl) {
        toast.success('Đang chuyển sang PayOS để hoàn tất thanh toán...')
        window.location.assign(data.data.checkoutUrl)
      } else {
        toast.success('Đăng ký gói thành công!')
        onClose()
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message || 'Không thể đăng ký gói. Vui lòng thử lại.'
      toast.error(message)
    } finally {
      setSubscribing(false)
    }
  }

  return (
    <Card className="min-w-0 border-primary/10 bg-[#2d241a] text-white shadow-none">
      <CardContent className="flex h-full min-w-0 flex-col gap-5 p-4 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-white">
            <Crown className="size-6" />
          </div>
          <div className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-sm font-black text-primary">
            {formatCurrency(packageInfo.price)}
          </div>
        </div>

        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/60">
            {packageInfo.durationDays} ngày
          </p>
          <h3 className="mt-2 text-2xl font-black leading-tight">{packageInfo.name}</h3>
          {packageInfo.description && (
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              {packageInfo.description}
            </p>
          )}
        </div>

        <ul className="space-y-3 text-sm">
          {features.map((feature) => (
            <li key={feature} className="flex gap-2">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-primary">
                <Check className="size-3.5" strokeWidth={3} />
              </span>
              <span className="leading-relaxed text-white/80">
                {feature}
              </span>
            </li>
          ))}
        </ul>

        {packageInfo.maxRooms && (
          <p className="text-xs font-semibold text-white/60">
            Tối đa {packageInfo.maxRooms} phòng
          </p>
        )}

        <div className="mt-auto space-y-3 pt-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-white/70">
            <ShieldCheck className="size-4 text-primary" />
            Thanh toán qua PayOS
          </div>
          <Button
            type="button"
            size="lg"
            variant="default"
            className="w-full transition-opacity hover:opacity-90 active:opacity-80"
            disabled={subscribing}
            onClick={handleSubscribe}
          >
            <Sparkles className="size-4" />
            {subscribing ? 'Đang tạo thanh toán...' : 'Đăng ký gói'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
