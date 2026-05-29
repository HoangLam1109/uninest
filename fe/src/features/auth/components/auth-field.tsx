import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function AuthField({
  id,
  label,
  children,
  hint,
  error,
  className,
}: {
  id: string
  label: string
  children: ReactNode
  hint?: string
  error?: string
  className?: string
}) {
  return (
    <div className={cn('space-y-2', className)}>
      <label htmlFor={id} className="text-sm font-semibold text-foreground">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}
