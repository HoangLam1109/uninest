import { Button, type ButtonProps } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type PaginationProps = {
  page: number
  totalPages: number
  isDisabled?: boolean
  showWhenSinglePage?: boolean
  className?: string
  controlsClassName?: string
  pageClassName?: string
  pageLabel?: string
  pageSeparator?: string
  previousLabel?: string
  nextLabel?: string
  buttonVariant?: ButtonProps['variant']
  buttonClassName?: string
  onPageChange: (page: number) => void
}

export function Pagination({
  page,
  totalPages,
  isDisabled = false,
  showWhenSinglePage = false,
  className,
  controlsClassName,
  pageClassName,
  pageLabel = 'Trang',
  pageSeparator = '/',
  previousLabel = 'Truoc',
  nextLabel = 'Sau',
  buttonVariant = 'ghost',
  buttonClassName = 'bg-white',
  onPageChange,
}: PaginationProps) {
  if (!showWhenSinglePage && totalPages <= 1) return null

  const currentPage = Math.min(Math.max(page, 1), Math.max(totalPages, 1))

  return (
    <div className={cn('flex items-center justify-end gap-3', className)}>
      <span className={cn('text-sm text-slate-500', pageClassName)}>
        {pageLabel} {currentPage}
        {pageSeparator}
        {Math.max(totalPages, 1)}
      </span>
      <div className={cn('flex gap-3', controlsClassName)}>
        <Button
          type="button"
          variant={buttonVariant}
          disabled={currentPage <= 1 || isDisabled}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          className={buttonClassName}
        >
          {previousLabel}
        </Button>
        <Button
          type="button"
          variant={buttonVariant}
          disabled={isDisabled || currentPage >= totalPages}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          className={buttonClassName}
        >
          {nextLabel}
        </Button>
      </div>
    </div>
  )
}
