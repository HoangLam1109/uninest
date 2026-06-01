import {
  BarChart3,
  ClipboardCheck,
  LayoutGrid,
  ShieldCheck,
  UserPlus,
  Users,
} from 'lucide-react'

export const adminNavItems = [
  { label: 'Tổng quan', href: '/quan-tri', icon: LayoutGrid },
  { label: 'Người dùng', href: '/quan-tri/nguoi-dung', icon: Users },
  { label: 'Kiểm duyệt', href: '/quan-tri/kiem-duyet', icon: ShieldCheck },
  { label: 'Báo cáo', href: '/quan-tri/bao-cao', icon: BarChart3 },
  { label: 'Ticket', href: '/quan-tri/ticket', icon: ClipboardCheck },
] as const

export const adminSidebarConfig = {
  baseHref: '/quan-tri',
  label: 'Admin Console',
  navLabel: 'Điều hướng quản trị',
  navItems: adminNavItems,
  ctaLabel: 'Tạo tài khoản',
  ctaIcon: UserPlus,
}

export const adminStats = [
  {
    label: 'Người dùng hoạt động',
    value: '2.418',
    change: '+86 tuần này',
    icon: Users,
  },
  {
    label: 'Tin đăng chờ duyệt',
    value: '34',
    change: '12 ưu tiên',
    icon: ShieldCheck,
  },
  {
    label: 'Doanh thu nền tảng',
    value: '482.000.000đ',
    change: '+18%',
    icon: BarChart3,
  },
  {
    label: 'Ticket quá hạn',
    value: '9',
    change: '3 khẩn cấp',
    icon: ClipboardCheck,
  },
] as const

export const adminUsers = [
  {
    id: 'u-1',
    name: 'Nguyễn Minh Khang',
    role: 'Chủ nhà',
    email: 'khang@example.com',
    status: 'verified',
    joinedAt: '12/06/2024',
  },
  {
    id: 'u-2',
    name: 'Trần Thu Hà',
    role: 'Người thuê',
    email: 'ha@example.com',
    status: 'active',
    joinedAt: '10/06/2024',
  },
  {
    id: 'u-3',
    name: 'Lê Quốc Bảo',
    role: 'Nhân viên',
    email: 'bao@example.com',
    status: 'new',
    joinedAt: '08/06/2024',
  },
] as const

export const adminModerationItems = [
  {
    id: 'm-1',
    title: 'Phòng studio Quận 1',
    owner: 'An House',
    status: 'pending',
    note: 'Thiếu ảnh giấy tờ',
  },
  {
    id: 'm-2',
    title: 'Căn hộ mini Thủ Đức',
    owner: 'UniStay',
    status: 'review',
    note: 'Giá thuê bất thường',
  },
  {
    id: 'm-3',
    title: 'Phòng đôi Cầu Giấy',
    owner: 'Nest Plus',
    status: 'approved',
    note: 'Đủ điều kiện hiển thị',
  },
] as const

export const adminStatusLabels = {
  all: 'Tất cả',
  verified: 'Đã xác minh',
  active: 'Hoạt động',
  new: 'Mới tạo',
  pending: 'Chờ duyệt',
  review: 'Cần rà soát',
  approved: 'Đã duyệt',
} as const

export const adminStatusStyles = {
  verified: 'bg-green-500/10 text-green-700',
  active: 'bg-primary/10 text-primary',
  new: 'bg-blue-500/10 text-blue-700',
  pending: 'bg-amber-500/10 text-amber-700',
  review: 'bg-red-500/10 text-red-600',
  approved: 'bg-green-500/10 text-green-700',
} as const
