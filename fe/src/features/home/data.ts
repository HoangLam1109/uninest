import { images } from '@/assets/images'
import { paths } from '@/config/constants'

export const navLinks = [
  { label: 'Trang chủ', href: paths.home },
  { label: 'Phòng cho thuê', href: paths.rooms },
  { label: 'Blog', href: paths.blog },
  { label: 'AI tìm phòng', href: paths.ai },
  { label: 'Điều khiển', href: paths.landlordDashboard },
] as const


export const whyChooseFeatures = [
  {
    title: 'An ninh tuyệt đối',
    description: 'Hệ thống camera 24/7 và khóa vân tay hiện đại cho mỗi phòng.',
    icon: 'shield' as const,
  },
  {
    title: 'Tiện nghi đầy đủ',
    description: 'Full nội thất từ máy lạnh, tủ lạnh đến máy giặt riêng biệt.',
    icon: 'home' as const,
  },
  {
    title: 'Hỗ trợ 24/7',
    description: 'Đội ngũ kỹ thuật và CSKH luôn sẵn sàng giải quyết mọi vấn đề.',
    icon: 'headset' as const,
  },
] as const

export const landlordBenefits = [
  'Quản lý vận hành toàn diện từ A-Z',
  'Tiếp cận tep khách hàng ổn định, minh bạch',
  'Minh bạch tài chính qua ứng dụng quản lý',
] as const

export const footerLinks = {
  explore: ['Tìm phòng', 'Ưu đãi cư dân', 'Ký túc xá', 'Căn hộ studio'],
  info: ['Về chúng tôi', 'Danh cho chu nha', 'Điều khoản dịch vụ', 'Chính sách bảo mật'],
} as const

export const budgetOptions = [
  { value: 'under-5', label: 'Dưới 5 triệu' },
  { value: '5-8', label: '5 - 8 triệu' },
  { value: '8-12', label: '8 - 12 triệu' },
  { value: 'over-12', label: 'Trên 12 triệu' },
] as const

export const roomTypeOptions = [
  { value: 'studio', label: 'Studio' },
  { value: 'apartment', label: 'Căn hộ' },
  { value: 'shared', label: 'Phòng ghép' },
  { value: 'single', label: 'Phòng đơn' },
] as const

export const homeFaqs = [
  {
    question: 'Uninest giúp chúng ta tìm phòng trọ tại TP.HCM như thế nào?',
    answer:
      'UniNest cho phep ban loc phong theo tu khoa, muc gia va loai phong, sau do xem chi tiet, hinh anh, tien ich va vi tri truoc khi gui yeu cau dat phong.',
  },
  {
    question: 'Ai nên sử dụng UniNest?',
    answer:
      'Nên sử dụng cho sinh viên, người đi làm và các chủ nhà cần một kênh đăng tin rõ ràng, minh bạch và dễ quản lý tại khu vực TP.HCM.',
  },
  {
    question: 'Thông tin nào cần kiểm tra trước khi đặt phòng?',
    answer:
      'Bạn nên xem giá thuê theo tháng, tiền cọc, diện tích, số người tối đa, tiện ích, địa chỉ và đánh giá của người thuê trước để chọn phòng phù hợp.',
  },
  {
    question: 'Làm sao để liên hệ chủ phòng trên UniNest?',
    answer:
      'Tại trang chi tiết phòng, bạn có thể nhận tin trực tiếp cho chủ phòng hoặc gửi yêu cầu đặt phòng để tiếp tục xác nhận lịch hẹn.'
  },
] as const

export { images }
