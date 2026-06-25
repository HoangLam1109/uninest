export type BankAccountStatus = 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED'

export type BankAccountUser = {
  _id: string
  fullName?: string
  email?: string
  phone?: string
  role?: string
}

export type BankAccount = {
  _id: string
  userId: string | BankAccountUser
  payosClientId?: string
  payosApiKey?: string
  payosChecksumKey?: string
  status: BankAccountStatus
  verifiedAt?: string
  verifiedBy?: string | BankAccountUser
  createdAt?: string
  updatedAt?: string
}

// ---- Payloads ----

export type CreateBankAccountPayload = {
  payosClientId: string
  payosApiKey: string
  payosChecksumKey: string
}

export type UpdateBankAccountPayload = {
  payosClientId?: string
  payosApiKey?: string
  payosChecksumKey?: string
}

// ---- API Responses ----

export type BankAccountResponse = {
  success: boolean
  message?: string
  data: BankAccount
}

export type BankAccountListResponse = {
  success: boolean
  data: BankAccount[]
}
