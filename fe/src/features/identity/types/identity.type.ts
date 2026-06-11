export type IdentityStatus = 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED'

export type CoTenant = {
  fullName: string
  dateOfBirth?: string
  phone?: string
  cccdNumber?: string
}

export type IdentityUser = {
  _id: string
  fullName: string
  email: string
  phone: string
}

export type Identity = {
  _id: string
  userId: string | IdentityUser
  fullName: string
  dateOfBirth: string
  phone: string
  cccdNumber: string
  cccdFrontImage: string
  cccdBackImage: string
  coTenants: CoTenant[]
  status: IdentityStatus
  verifiedAt?: string
  verifiedBy?: string | IdentityUser
  createdAt: string
  updatedAt: string
}

export type CreateIdentityPayload = {
  fullName: string
  dateOfBirth: string
  phone: string
  cccdNumber: string
  cccdFront: File
  cccdBack: File
  coTenants?: CoTenant[]
}

export type UpdateIdentityPayload = {
  fullName?: string
  dateOfBirth?: string
  phone?: string
  cccdFront?: File
  cccdBack?: File
  coTenants?: CoTenant[]
}

export type IdentityListResponse = {
  success: boolean
  data: Identity[]
  message?: string
}

export type IdentityResponse = {
  success: boolean
  data: Identity
  message?: string
}
