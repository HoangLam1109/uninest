import {
  ArrowLeft,
  CalendarDays,
  CreditCard,
  FileText,
  Gauge,
  Heart,
  Home,
  User,
  Wrench,
} from 'lucide-react'

export const tenantNavItems = [

  { label: 'Đặt phòng', href: '/cu-dan/dat-phong', icon: CalendarDays },
  { label: 'Hóa đơn', href: '/cu-dan/hoa-don', icon: FileText },
  { label: 'Chỉ số điện nước', href: '/cu-dan/chi-so', icon: Gauge },
  { label: 'Hồ sơ cá nhân', href: '/cu-dan/ho-so', icon: User },
  { label: 'Phòng đã lưu', href: '/cu-dan/phong-da-luu', icon: Heart },
  { label: 'Hợp đồng', href: '/cu-dan/hop-dong', icon: Home },
] as const

export const tenantSidebarConfig = {
  baseHref: '/cu-dan/dat-phong',
  label: 'Cổng người thuê',
  navLabel: 'Điều hướng người thuê',
  navItems: tenantNavItems,
  ctaLabel: 'Trang chủ',
  ctaIcon: ArrowLeft,
}

export const tenantStats = [
  { label: 'Tiền thuê tháng này', value: '4.500.000đ', change: 'Hạn 12/06', icon: CreditCard },
  { label: 'Ngày còn lại hợp đồng', value: '238', change: 'Kết thúc 02/2025', icon: CalendarDays },
  { label: 'Yêu cầu bảo trì', value: '2', change: '1 đang xử lý', icon: Wrench },
  { label: 'Phòng đã lưu', value: '7', change: '3 phòng mới', icon: Heart },
] as const

export const tenantInvoices = [
  {
    id: 'i-1',
    code: 'HD-0624-102',
    title: 'Tiền thuê tháng 06',
    due: '12/06/2024',
    amount: '4.500.000đ',
    status: 'unpaid',
  },
  {
    id: 'i-2',
    code: 'HD-0524-102',
    title: 'Tiền thuê tháng 05',
    due: '12/05/2024',
    amount: '4.500.000đ',
    status: 'paid',
  },
  {
    id: 'i-3',
    code: 'DV-0624-102',
    title: 'Điện, nước và internet',
    due: '15/06/2024',
    amount: '820.000đ',
    status: 'pending',
  },
] as const

export const tenantMaintenance = [
  {
    id: 'm-1',
    title: 'Khóa cửa phòng bị kẹt',
    room: 'P.102',
    status: 'processing',
    updatedAt: 'Hôm nay',
  },
  {
    id: 'm-2',
    title: 'Vòi nước lavabo rò rỉ',
    room: 'P.102',
    status: 'scheduled',
    updatedAt: 'Ngày mai 09:00',
  },
  {
    id: 'm-3',
    title: 'Thay bóng đèn ban công',
    room: 'P.102',
    status: 'done',
    updatedAt: '10/06/2024',
  },
] as const

export const tenantSavedRooms = [
  {
    id: 's-1',
    title: 'Studio gần ĐH Kinh tế',
    location: 'Quận 7, TP.HCM',
    price: '5.200.000đ/tháng',
    status: 'available',
  },
  {
    id: 's-2',
    title: 'Phòng đôi Cầu Giấy',
    location: 'Cầu Giấy, Hà Nội',
    price: '4.800.000đ/tháng',
    status: 'new',
  },
  {
    id: 's-3',
    title: 'Căn hộ mini Thủ Đức',
    location: 'Thủ Đức, TP.HCM',
    price: '6.100.000đ/tháng',
    status: 'viewed',
  },
] as const

export const tenantStatusLabels = {
  all: 'Tất cả',
  unpaid: 'Chưa thanh toán',
  paid: 'Đã thanh toán',
  pending: 'Đang chờ',
  processing: 'Đang xử lý',
  scheduled: 'Đã lên lịch',
  done: 'Hoàn tất',
  available: 'Còn trống',
  new: 'Mới',
  viewed: 'Đã xem',
} as const

export const tenantStatusStyles = {
  unpaid: 'bg-red-500/10 text-red-600',
  paid: 'bg-green-500/10 text-green-700',
  pending: 'bg-amber-500/10 text-amber-700',
  processing: 'bg-primary/10 text-primary',
  scheduled: 'bg-blue-500/10 text-blue-700',
  done: 'bg-green-500/10 text-green-700',
  available: 'bg-green-500/10 text-green-700',
  new: 'bg-primary/10 text-primary',
  viewed: 'bg-slate-100 text-slate-600',
} as const
