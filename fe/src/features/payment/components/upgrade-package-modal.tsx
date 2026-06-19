import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BadgeCheck,
  Building2,
  Check,
  Crown,
  Home,
  KeyRound,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Modal } from '@/components/ui/modal'
import { USER_ROLES } from '@/constants/roles'
import { paths } from '@/config/constants'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'
import { useRoleUpgradePayment } from '../hooks/use-role-upgrade-payment'
import type { RoleUpgradeTarget } from '../types/payment.type'

const packages: Array<{
  role: RoleUpgradeTarget
  title: string
  eyebrow: string
  price: string
  icon: typeof Home
  tone: 'light' | 'warm'
  features: string[]
}> = [
  {
    role: USER_ROLES.TENANT,
    title: 'Gói Tenant',
    eyebrow: 'Dành cho người thuê',
    price: '30.000đ',
    icon: KeyRound,
    tone: 'light',
    features: [
      'Đặt phòng và theo dõi lịch hẹn',
      'Quản lý hợp đồng thuê',
      'Nhận và thanh toán hóa đơn',
      'Lưu phòng yêu thích',
    ],
  },
  {
    role: USER_ROLES.LANDLORD,
    title: 'Gói Landlord',
    eyebrow: 'Dành cho chủ nhà',
    price: '99.000đ',
    icon: Building2,
    tone: 'warm',
    features: [
      'Đăng và quản lý phòng cho thuê',
      'Duyệt yêu cầu đặt phòng',
      'Tạo hợp đồng và hóa đơn',
      'Theo dõi khách thuê và doanh thu',
    ],
  },
]

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
  const navigate = useNavigate()
  const { user, isLoggedIn } = useAuth()
  const roleUpgradePayment = useRoleUpgradePayment()

  function handleUpgrade(targetRole: RoleUpgradeTarget) {
    if (!isLoggedIn) {
      toast.info('Vui lòng đăng nhập để nâng cấp gói')
      navigate(paths.login)
      onClose()
      return
    }

    if (user?.role && user.role !== USER_ROLES.GUEST) {
      toast.info('Tài khoản của bạn đã được nâng cấp')
      return
    }

    roleUpgradePayment.mutate({ targetRole })
  }

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

      <div className="grid gap-4 p-4 md:grid-cols-2 sm:p-6">
        {packages.map((pkg) => (
          <UpgradePackageCard
            key={pkg.role}
            packageInfo={pkg}
            loading={roleUpgradePayment.isPending}
            onUpgrade={() => handleUpgrade(pkg.role)}
          />
        ))}
      </div>
    </Modal>
  )
}

function UpgradePackageCard({
  packageInfo,
  loading,
  onUpgrade,
}: {
  packageInfo: (typeof packages)[number]
  loading: boolean
  onUpgrade: () => void
}) {
  const Icon = packageInfo.icon

  return (
    <Card
      className={cn(
        'min-w-0 border-primary/10 shadow-none',
        packageInfo.tone === 'warm'
          ? 'bg-[#2d241a] text-white'
          : 'bg-white text-foreground',
      )}
    >
      <CardContent className="flex h-full min-w-0 flex-col gap-5 p-4 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div
            className={cn(
              'flex size-12 items-center justify-center rounded-xl',
              packageInfo.tone === 'warm'
                ? 'bg-primary text-white'
                : 'bg-primary/10 text-primary',
            )}
          >
            <Icon className="size-6" />
          </div>
          <div className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-sm font-black text-primary">
            {packageInfo.price}
          </div>
        </div>

        <div className="min-w-0">
          <p
            className={cn(
              'text-xs font-bold uppercase tracking-[0.12em]',
              packageInfo.tone === 'warm' ? 'text-white/60' : 'text-muted-foreground',
            )}
          >
            {packageInfo.eyebrow}
          </p>
          <h3 className="mt-2 text-2xl font-black leading-tight">{packageInfo.title}</h3>
        </div>

        <ul className="space-y-3 text-sm">
          {packageInfo.features.map((feature) => (
            <li key={feature} className="flex gap-2">
              <span
                className={cn(
                  'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full',
                  packageInfo.tone === 'warm'
                    ? 'bg-white/10 text-primary'
                    : 'bg-primary/10 text-primary',
                )}
              >
                <Check className="size-3.5" strokeWidth={3} />
              </span>
              <span
                className={cn(
                  'leading-relaxed',
                  packageInfo.tone === 'warm' ? 'text-white/80' : 'text-muted-foreground',
                )}
              >
                {feature}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-auto space-y-3 pt-2">
          <div
            className={cn(
              'flex items-center gap-2 text-xs font-semibold',
              packageInfo.tone === 'warm' ? 'text-white/70' : 'text-muted-foreground',
            )}
          >
            {packageInfo.role === USER_ROLES.LANDLORD ? (
              <ShieldCheck className="size-4 text-primary" />
            ) : (
              <BadgeCheck className="size-4 text-primary" />
            )}
            Thanh toán qua PayOS
          </div>
          <Button
            type="button"
            size="lg"
            variant={packageInfo.tone === 'warm' ? 'default' : 'dark'}
            className="w-full"
            disabled={loading}
            onClick={onUpgrade}
          >
            <Sparkles className="size-4" />
            {loading ? 'Đang tạo thanh toán...' : 'Thanh toán gói'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
