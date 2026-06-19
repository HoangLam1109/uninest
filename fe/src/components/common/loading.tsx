import { cn } from '@/lib/utils'

export function Loading({
  className,
  label = 'Đang tải...',
}: {
  className?: string
  label?: string
}) {
  return (
    <output
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-12',
        className,
      )}
      aria-live="polite"
    >
      <span className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
    </output>
  )
}
