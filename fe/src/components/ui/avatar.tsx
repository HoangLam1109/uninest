import { useState } from 'react'
import { cn } from '@/lib/utils'

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

type AvatarProps = {
  name: string
  src?: string
  className?: string
}

export function Avatar({ name, src, className }: AvatarProps) {
  const [imgError, setImgError] = useState(false)

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setImgError(true)}
        className={cn(
          'inline-flex size-10 shrink-0 rounded-full object-cover',
          className,
        )}
      />
    )
  }

  return (
    <span
      className={cn(
        'inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground',
        className,
      )}
      aria-hidden
    >
      {getInitials(name)}
    </span>
  )
}
