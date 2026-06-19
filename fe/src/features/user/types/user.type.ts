import type { UserRole } from '@/constants/roles'

export type User = {
  _id: string
  fullName: string
  phone: string
  email: string
  avatarUrl?: string
  role?: UserRole
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

export type UserPayload = {
  email: string
  fullName: string
  phone: string
  password?: string
  role?: UserRole
  isActive?: boolean
}

export type UserSearchResult = Pick<User, '_id' | 'fullName' | 'phone' | 'email'>

export type UserSearchResponse = {
  success: boolean
  data: UserSearchResult[]
}

export type UserResponse = {
  success: boolean
  message?: string
  data: User
}

export type UserListResponse = {
  success: boolean
  data: User[]
}
