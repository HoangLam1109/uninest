import { api } from "@/lib/api-client";
import type {
  LoginPayload,
  LoginResponse,
  MeResponse,
  RegisterPayload,
  RegisterResponse,
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

  /** GET /api/auth/me */
  getMe: () => api.get<MeResponse>("/auth/me"),
};
