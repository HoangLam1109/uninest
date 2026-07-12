import type { z } from '@/lib/zod'
import type {
  forgotPasswordEmailSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from '../schemas/auth.schema'

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>
export type ForgotPasswordEmailFormValues = z.infer<typeof forgotPasswordEmailSchema>
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>
