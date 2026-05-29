import type { UserRole } from '@/constants/roles'

export type AuthUser = {
  id: string
  email: string
  fullName: string
  phone?: string
  role?: UserRole
}

export type LoginPayload = {
  email: string
  password: string
}

export type RegisterPayload = {
  fullName: string
  email: string
  phone: string
  password: string
}

export type AuthResponse = {
  user: AuthUser
  accessToken: string
  refreshToken: string
}

export type RefreshTokenResponse = {
  accessToken: string
}

export type AuthUserResponse = {
  user: AuthUser
}