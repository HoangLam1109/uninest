import type { LucideIcon } from 'lucide-react'
import {
  Building2,
  FileText,
  LayoutGrid,
  Settings,
  UserPlus,
  Users,
  Zap,
} from 'lucide-react'

export type LandlordNavItem = {
  label: string
  href: string
  icon: LucideIcon
}

export const landlordNavItems: LandlordNavItem[] = [
  { label: 'Tổng quan', href: '/chu-nha', icon: LayoutGrid },
  { label: 'Quản lý phòng', href: '/chu-nha/phong', icon: Building2 },
  { label: 'Người thuê', href: '/chu-nha/nguoi-thue', icon: Users },
  { label: 'Hóa đơn', href: '/chu-nha/hoa-don', icon: FileText },
  { label: 'Tiện ích', href: '/chu-nha/tien-ich', icon: Zap },
  { label: 'Cài đặt', href: '/chu-nha/cai-dat', icon: Settings },
]

export const landlordSidebarConfig = {
  baseHref: '/chu-nha',
  label: 'Chủ nhà Dashboard',
  navLabel: 'Điều hướng chủ nhà',
  navItems: landlordNavItems,
  ctaLabel: 'Thêm người thuê mới',
  ctaIcon: UserPlus,
}

export const landlordStats = [
  {
    label: 'Doanh thu tháng này',
    value: '125.000.000đ',
    badge: '+15%',
    badgeClass: 'bg-green-500/10 text-green-600',
  },
  {
    label: 'Phòng đang trống',
    value: '05/50',
    badge: 'Tỉ lệ 10%',
    badgeClass: 'bg-primary/10 text-primary',
  },
  {
    label: 'Khách thuê mới',
    value: '12',
    badge: '+4',
    badgeClass: 'bg-green-500/10 text-green-600',
  },
  {
    label: 'Sự cố kỹ thuật',
    value: '02',
    badge: 'Cần xử lý',
    badgeClass: 'bg-red-500/10 text-red-600',
  },
] as const

export const revenueMonths = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'] as const

export const utilityWeekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'] as const

export type PaymentStatus = 'success' | 'pending' | 'overdue'

export type RecentPayment = {
  id: string
  tenantName: string
  room: string
  date: string
  amount: string
  status: PaymentStatus
}

export const recentPayments: RecentPayment[] = [
  {
    id: '1',
    tenantName: 'Nguyễn Văn An',
    room: 'P.102',
    date: '12/06/2024',
    amount: '4.500.000đ',
    status: 'success',
  },
  {
    id: '2',
    tenantName: 'Lê Thị Trinh',
    room: 'P.305',
    date: '11/06/2024',
    amount: '5.200.000đ',
    status: 'pending',
  },
  {
    id: '3',
    tenantName: 'Trần Minh Hoàng',
    room: 'P.201',
    date: '10/06/2024',
    amount: '4.800.000đ',
    status: 'success',
  },
  {
    id: '4',
    tenantName: 'Phạm Mai Hương',
    room: 'P.410',
    date: '09/06/2024',
    amount: '3.900.000đ',
    status: 'overdue',
  },
]

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  success: 'Thành công',
  pending: 'Đang chờ',
  overdue: 'Quá hạn',
}

export const paymentStatusStyles: Record<PaymentStatus, string> = {
  success: 'bg-green-500/10 text-green-700',
  pending: 'bg-primary/10 text-primary',
  overdue: 'bg-red-500/10 text-red-600',
}

export { UserPlus }
