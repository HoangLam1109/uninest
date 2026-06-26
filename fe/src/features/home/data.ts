import { images } from '@/assets/images'
import { paths } from '@/config/constants'


export const navLinks = [
  { label: 'Trang chủ', href: paths.home },
  { label: 'Phòng cho thuê', href: paths.rooms },
  { label: 'AI tìm phòng', href: paths.ai },
  { label: 'Điều khiển', href: paths.landlordDashboard },
] as const

export const featuredRooms = [
  {
    title: 'Studio sang trọng',
    location: 'Quận 1, TP.HCM',
    price: '8tr',
    image: images.rooms[0],
    badge: 'GIẢM 10%',
  },
  {
    title: 'Căn hộ hiện đại',
    location: 'Quận 7, TP.HCM',
    price: '6tr',
    image: images.rooms[1],
  },
  {
    title: 'Phòng tiện nghi',
    location: 'Bình Thạnh, TP.HCM',
    price: '4tr',
    image: images.rooms[2],
  },
  {
    title: 'Ký túc xá cao cấp',
    location: 'Phú Nhuận, TP.HCM',
    price: '2tr',
    image: images.rooms[3],
  },
] as const

export const whyChooseFeatures = [
  {
    title: 'An ninh tuyệt đối',
    description: 'Hệ thống camera 24/7 và khóa vân tay hiện đại cho mỗi phòng.',
    icon: 'shield' as const,
  },
  {
    title: 'Tiện nghi đầy đủ',
    description: 'Full nội thất từ máy lạnh, tủ lạnh đến máy giặt riêng lẻ.',
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
  'Tiếp cận tệp khách hàng ổn định, văn minh',
  'Minh bạch tài chính qua ứng dụng quản lý',
] as const

export const footerLinks = {
  explore: ['Tìm phòng', 'Ưu đãi cư dân', 'Ký túc xá', 'Căn hộ Studio'],
  info: ['Về chúng tôi', 'Dành cho chủ nhà', 'Điều khoản dịch vụ', 'Chính sách bảo mật'],
} as const

export const budgetOptions = [
  { value: 'under-5', label: 'Dưới 5 triệu' },
  { value: '5-8', label: '5 – 8 triệu' },
  { value: '8-12', label: '8 – 12 triệu' },
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
    question: 'UniNest giúp tìm phòng trọ tại TP.HCM như thế nào?',
    answer:
      'UniNest cho phép bạn lọc phòng theo từ khóa, mức giá và loại phòng, sau đó xem chi tiết, hình ảnh, tiện ích và vị trí trước khi gửi yêu cầu đặt phòng.',
  },
  {
    question: 'Ai nên sử dụng UniNest?',
    answer:
      'Nền tảng phù hợp với sinh viên, người đi làm và các chủ nhà cần một kênh đăng tin rõ ràng, minh bạch và dễ quản lý tại khu vực TP.HCM.',
  },
  {
    question: 'Thông tin nào cần kiểm tra trước khi đặt phòng?',
    answer:
      'Bạn nên xem giá thuê theo tháng, tiền cọc, diện tích, số người tối đa, tiện ích, địa chỉ và đánh giá của người thuê trước để chọn phòng phù hợp.',
  },
  {
    question: 'Làm sao để liên hệ chủ phòng trên UniNest?',
    answer:
      'Tại trang chi tiết phòng, bạn có thể nhắn tin trực tiếp cho chủ phòng hoặc gửi yêu cầu đặt phòng để tiếp tục xác nhận lịch hẹn.',
  },
] as const

export { images }
