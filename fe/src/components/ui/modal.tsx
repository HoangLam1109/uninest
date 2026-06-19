import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  className?: string
}) {
  if (!open) return null

  return createPortal(
    <dialog
      className="fixed inset-0 z-50 flex h-dvh max-h-none w-dvw max-w-none items-center justify-center bg-transparent p-4"
      open
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <button
        type="button"
        className="absolute inset-0 bg-foreground/40"
        aria-label="Đóng"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative z-10 w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-xl',
          className,
        )}
      >
        {title ? (
          <h2 id="modal-title" className="mb-4 text-lg font-bold text-foreground">
            {title}
          </h2>
        ) : null}
        {children}
      </div>
    </dialog>,
    document.body,
  )
}
