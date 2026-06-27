// Bank Account Feature
// Hooks
export {
  bankAccountKeys,
  useCreateBankAccount,
  useGetAdminBankAccounts,
  useGetLandlordBankAccount,
  useGetMyBankAccounts,
  useGetMyVerifiedBankAccount,
  useRejectBankAccount,
  useUpdateBankAccount,
  useVerifyBankAccount,
} from './hooks/use-bank-accounts'

// API
export { bankAccountApi } from './api/bank-account.api'

// Types
export type {
  BankAccount,
  BankAccountResponse,
  BankAccountListResponse,
  BankAccountStatus,
  BankAccountUser,
  CreateBankAccountPayload,
  UpdateBankAccountPayload,
} from './types/bank-account.type'

// Pages (lazy imports)
export { LandlordBankAccountPage } from './pages/landlord-bank-account-page'
export { AdminBankAccountModerationPage } from './pages/admin-bank-account-moderation-page'
