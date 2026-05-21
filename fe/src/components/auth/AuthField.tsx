import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function AuthField({
  id,
  label,
  children,
  hint,
  className,
}: {
  id: string
  label: string
  children: ReactNode
  hint?: string
  className?: string
}) {
  return (
    <div className={cn('space-y-2', className)}>
      <label htmlFor={id} className="text-sm font-semibold text-foreground">
        {label}
      </label>
      {children}
      {hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}
