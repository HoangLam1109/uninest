export const paths = {
  home: '/',
  blog: '/blog',
  blogDetail: '/blog/:slug',
  ai: '/ai',
  login: '/dang-nhap',
  register: '/dang-ky',
  forgotPassword: '/quen-mat-khau',
  rooms: '/phong',
  roomDetail: '/phong/:id',
  createRoom: '/dang-tin',
  dashboard: '/dashboard',
  landlordDashboard: '/chu-nha',
  tenantDashboard: '/cu-dan',
  adminDashboard: '/quan-tri',
  adminBlogs: '/quan-tri/blog',
  staffDashboard: '/nhan-vien',
  paymentSuccess: '/payment/success',
  paymentCancel: '/payment/cancel',
} as const

export const APP_NAME = 'UniNest'
