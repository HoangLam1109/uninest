import { api } from "@/lib/api-client";
import type {
  AuthMessageResponse,
  ForgotPasswordPayload,
  LoginPayload,
  LoginResponse,
  MeResponse,
  RegisterPayload,
  RegisterResponse,
  ResetPasswordPayload,
  SendRegisterOtpPayload,
  SendRegisterOtpResponse,
} from "@/types/auth";

export const authApi = {
  sendRegisterOtp: (payload: SendRegisterOtpPayload) =>
    api.post<SendRegisterOtpResponse>("/auth/register/send-otp", payload),

  register: (payload: RegisterPayload) =>
    api.post<RegisterResponse>("/auth/register", payload),

  login: (payload: LoginPayload) =>
    api.post<LoginResponse>("/auth/login", payload),

  forgotPassword: (payload: ForgotPasswordPayload) =>
    api.post<AuthMessageResponse>("/auth/forgot-password", payload),

  resetPassword: (payload: ResetPasswordPayload) =>
    api.post<AuthMessageResponse>("/auth/reset-password", payload),

  /** GET /api/auth/me */
  getMe: () => api.get<MeResponse>("/auth/me"),
};
