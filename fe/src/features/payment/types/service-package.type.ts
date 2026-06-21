export type ServicePackageFeature = {
  key: string
  label: string
}

export type ServicePackage = {
  _id: string
  name: string
  description?: string
  price: number
  durationDays: number
  targetRole: 'TENANT' | 'LANDLORD'
  features?: Record<string, string>
  maxRooms?: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type CreateServicePackagePayload = {
  name: string
  price: number
  durationDays: number
  targetRole: 'TENANT' | 'LANDLORD'
  description?: string
  features?: Record<string, string>
  maxRooms?: number
}

export type UpdateServicePackagePayload = Partial<CreateServicePackagePayload> & {
  isActive?: boolean
}

export type ServicePackagePagination = {
  total: number
  page: number
  limit: number
  totalPages: number
}

export type ServicePackageResponse = {
  success: boolean
  message?: string
  data: ServicePackage
}

export type ServicePackageListResponse = {
  success: boolean
  data: ServicePackage[]
  pagination: ServicePackagePagination
}
