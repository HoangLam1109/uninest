export type AuthUser = {
  id: string
  email: string
  fullName: string
  phone?: string
}

export type LoginPayload = {
  identifier: string
  password: string
  remember?: boolean
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
}
