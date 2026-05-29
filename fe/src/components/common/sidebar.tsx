import { cn } from '@/lib/utils'

export function Sidebar({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        'hidden w-64 shrink-0 border-r border-border bg-surface lg:block',
        className,
      )}
      aria-label="Sidebar"
    />
  )
}
