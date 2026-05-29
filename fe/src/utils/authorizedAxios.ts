import { handleLogoutAPI, refreshTokenAPI } from '@/api/authApi';
import axios from 'axios';
import { toast } from 'react-toastify';
// Khởi tạo một đối tượng  Axios 
const authorizedAxiosInstance = axios.create()

// Thời gian tối đa của một request
authorizedAxiosInstance.defaults.timeout = 10000 * 60 * 10

// Cho phép gửi cookie kèm theo request
authorizedAxiosInstance.defaults.withCredentials = true

authorizedAxiosInstance.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
)


authorizedAxiosInstance.interceptors.response.use(
  (response) => response,

  async (error) => {
    console.log('AXIOS ERROR:', error)

    if (!error.response) {
      toast.error('Lỗi kết nối mạng')
      return Promise.reject(error)
    }

    const originalRequest = error.config
    const url = originalRequest?.url || ''

    // Xử lý login sai (400)
    if (url.includes('/api/login') && error.response.status === 400) {
      const errorMessage = error.response.data?.message || 'Đăng nhập thất bại'
      toast.error(errorMessage)
      return Promise.reject(error)
    }

    // Refresh token khi 410
    if (error.response.status === 410 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        await refreshTokenAPI()
        return authorizedAxiosInstance(originalRequest)
      } catch (err) {
        console.error('Refresh token failed:', err)
        await handleLogoutAPI()
        location.href = '/dang-nhap'
        return Promise.reject(err)
      }
    }

    // Session expired (401)
    if (error.response.status === 401) {
      toast.error('Phiên làm việc hết hạn')
      setTimeout(() => {
        location.href = '/dang-nhap'
      }, 500)
      return Promise.reject(error)
    }

    // Default error handling
    toast.error(error.response.data?.message || error.message || 'Có lỗi xảy ra')
    return Promise.reject(error)
  }
)

export default authorizedAxiosInstance