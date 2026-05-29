import { api } from '@/lib/axios'
import type { ApiResponse } from '@/types/api'
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
} from '@/types/auth'

/** Auth HTTP layer — import from hooks, not from a global services folder. */
export const authApi = {
  login: (payload: LoginPayload) =>
    api.post<ApiResponse<AuthResponse>>('/login', payload),

  register: (payload: RegisterPayload) =>
    api.post<ApiResponse<AuthResponse>>('/register', payload),

  logout: () => api.post('/logout'),
}
