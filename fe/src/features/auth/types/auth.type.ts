import type { z } from '@/lib/zod'
import type { loginSchema, registerSchema } from '../schemas/auth.schema'

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>
