import { api } from "@/lib/api-client";
import type {
  LoginPayload,
  LoginResponse,
  MeResponse,
  RegisterPayload,
  RegisterResponse,
  SendRegisterOtpPayload,
} from "@/types/auth";

export const authApi = {
  register: (payload: RegisterPayload) =>
    api.post<RegisterResponse>("/auth/register", payload),

  sendRegisterOtp: (payload: SendRegisterOtpPayload) =>
    api.post<RegisterResponse>("/auth/register/send-otp", payload),

  login: (payload: LoginPayload) =>
    api.post<LoginResponse>("/auth/login", payload),

  /** GET /api/auth/me */
  getMe: () => api.get<MeResponse>("/auth/me"),
};
