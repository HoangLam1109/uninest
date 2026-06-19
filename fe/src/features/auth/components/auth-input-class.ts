import { cn } from '@/lib/utils'

export const authInputClass =
  'h-12 border border-border bg-surface px-4 text-sm font-medium'

export function authInputClassName(hasError?: boolean) {
  return cn(authInputClass, hasError && 'border-red-500 focus-visible:ring-red-500')
}
