import {
  CalendarCheck,
  ClipboardList,
  Headphones,
  Home,
  LayoutGrid,
  MessageSquareWarning,
} from 'lucide-react'

export const staffNavItems = [
  { label: 'Tổng quan', href: '/nhan-vien', icon: LayoutGrid },
  { label: 'Hồ sơ phòng', href: '/nhan-vien/ho-so', icon: Home },
  { label: 'Hỗ trợ', href: '/nhan-vien/ho-tro', icon: Headphones },
  { label: 'Lịch hẹn', href: '/nhan-vien/lich-hen', icon: CalendarCheck },
  { label: 'Công việc', href: '/nhan-vien/cong-viec', icon: ClipboardList },
] as const

export const staffSidebarConfig = {
  baseHref: '/nhan-vien',
  label: 'Staff Workspace',
  navLabel: 'Điều hướng nhân viên',
  navItems: staffNavItems,
  ctaLabel: 'Tạo phiếu hỗ trợ',
  ctaIcon: MessageSquareWarning,
}

export const staffStats = [
  { label: 'Hồ sơ cần kiểm tra', value: '18', change: '6 mới', icon: Home },
  { label: 'Ticket đang mở', value: '27', change: '4 khẩn cấp', icon: Headphones },
  { label: 'Lịch hẹn hôm nay', value: '11', change: '2 đổi giờ', icon: CalendarCheck },
  { label: 'Tin đăng đã xử lý', value: '96', change: '+14%', icon: ClipboardList },
] as const

export const staffQueues = {
  rooms: [
    {
      id: 'r-1',
      title: 'Studio Q.7',
      owner: 'An House',
      priority: 'high',
      status: 'Cần kiểm ảnh',
      note: '5 ảnh bị mờ, cần yêu cầu chủ nhà cập nhật lại.',
    },
    {
      id: 'r-2',
      title: 'Phòng đôi Cầu Giấy',
      owner: 'Nest Plus',
      priority: 'medium',
      status: 'Đang xác minh',
      note: 'Chờ giấy phép và thông tin tiện ích.',
    },
    {
      id: 'r-3',
      title: 'Căn hộ mini Thủ Đức',
      owner: 'UniStay',
      priority: 'low',
      status: 'Sẵn sàng',
      note: 'Đủ thông tin, có thể chuyển duyệt.',
    },
  ],
  tickets: [
    {
      id: 't-1',
      title: 'Khách báo lỗi khóa cửa',
      owner: 'P.305',
      priority: 'high',
      status: 'Khẩn cấp',
      note: 'Cần gọi lại trước 10:00.',
    },
    {
      id: 't-2',
      title: 'Yêu cầu đổi lịch xem phòng',
      owner: 'Minh Anh',
      priority: 'medium',
      status: 'Đang gọi',
      note: 'Khách muốn chuyển sang 15:30.',
    },
    {
      id: 't-3',
      title: 'Cập nhật hợp đồng thuê',
      owner: 'P.102',
      priority: 'low',
      status: 'Chờ phản hồi',
      note: 'Đợi chủ nhà xác nhận phụ lục.',
    },
  ],
  appointments: [
    {
      id: 'a-1',
      title: 'Hoàng Nam',
      owner: 'Studio Q.7',
      priority: 'medium',
      status: '10:00',
      note: 'Đã xác nhận xem trực tiếp.',
    },
    {
      id: 'a-2',
      title: 'Bảo Trân',
      owner: 'Phòng đôi Cầu Giấy',
      priority: 'low',
      status: '15:30',
      note: 'Chờ gọi lại trước lịch hẹn.',
    },
    {
      id: 'a-3',
      title: 'Gia Huy',
      owner: 'Căn hộ mini Thủ Đức',
      priority: 'high',
      status: '17:00',
      note: 'Khách cần xác nhận đặt cọc.',
    },
  ],
} as const

export const staffPriorityLabels = {
  all: 'Tất cả',
  high: 'Cao',
  medium: 'Trung bình',
  low: 'Thấp',
} as const

export const staffPriorityStyles = {
  high: 'bg-red-500/10 text-red-600',
  medium: 'bg-amber-500/10 text-amber-700',
  low: 'bg-green-500/10 text-green-700',
} as const
