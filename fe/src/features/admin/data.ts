import {
  CreditCard,
  LayoutGrid,
  PackagePlus,
  ShieldCheck,
  Users,
} from 'lucide-react'

export const adminNavItems = [
  { label: 'Tổng quan', href: '/quan-tri', icon: LayoutGrid },
  { label: 'Người dùng', href: '/quan-tri/nguoi-dung', icon: Users },
  { label: 'Kiểm duyệt', href: '/quan-tri/kiem-duyet', icon: ShieldCheck },
  { label: 'Gói dịch vụ', href: '/quan-tri/goi-dich-vu', icon: PackagePlus },
  { label: 'Doanh thu', href: '/quan-tri/doanh-thu', icon: CreditCard },
] as const

export const adminSidebarConfig = {
  baseHref: '/quan-tri',
  label: 'Admin Console',
  navLabel: 'Điều hướng quản trị',
  navItems: adminNavItems,
  ctaIcon: CreditCard,
}

