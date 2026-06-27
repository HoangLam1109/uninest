import {
  ArrowLeftRight,
  CreditCard,
  LayoutGrid,
  PackagePlus,
  ShieldCheck,
  UserPlus,
  Users,
} from 'lucide-react'

export const adminNavItems = [
  { label: 'Tổng quan', href: '/quan-tri', icon: LayoutGrid },
  { label: 'Người dùng', href: '/quan-tri/nguoi-dung', icon: Users },
  { label: 'Kiểm duyệt', href: '/quan-tri/kiem-duyet', icon: ShieldCheck },
  { label: 'Thanh toán', href: '/quan-tri/thanh-toan', icon: CreditCard },
  { label: 'Giao dịch', href: '/quan-tri/giao-dich', icon: ArrowLeftRight },
  { label: 'Gói dịch vụ', href: '/quan-tri/goi-dich-vu', icon: PackagePlus },
] as const

export const adminSidebarConfig = {
  baseHref: '/quan-tri',
  label: 'Admin Console',
  navLabel: 'Điều hướng quản trị',
  navItems: adminNavItems,
  ctaIcon: UserPlus,
}

