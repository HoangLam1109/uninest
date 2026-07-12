import { api } from '@/lib/axios'
import type { ApiResponse } from '@/types/api'
import type {
  AuthResponse,
  AuthUserResponse,
  ForgotPasswordPayload,
  LoginPayload,
  RefreshTokenResponse,
  RegisterPayload,
  ResetPasswordPayload,
  SendRegisterOtpPayload,
} from '@/types/auth'

export const authApi = {
  login: (payload: LoginPayload) =>
    api.post<ApiResponse<AuthResponse>>('/auth/login', payload),

  register: (payload: RegisterPayload) =>
    api.post<ApiResponse<{ message: string }>>('/auth/register', payload),

  sendRegisterOtp: (payload: SendRegisterOtpPayload) =>
    api.post<ApiResponse<{ message: string }>>('/auth/register/send-otp', payload),

  forgotPassword: (payload: ForgotPasswordPayload) =>
    api.post<ApiResponse<{ message: string }>>('/auth/forgot-password', payload),

  resetPassword: (payload: ResetPasswordPayload) =>
    api.post<ApiResponse<{ message: string }>>('/auth/reset-password', payload),

  refresh: (refreshToken: string) =>
    api.post<ApiResponse<RefreshTokenResponse>>('/auth/refresh-token', {
      refreshToken,
    }),
  getMe: () => api.get<ApiResponse<AuthUserResponse>>('/auth/me'),
  logout: () => api.post<ApiResponse<{ message: string }>>('/auth/logout'),
}
