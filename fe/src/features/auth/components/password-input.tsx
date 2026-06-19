import { forwardRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { authInputClassName } from './auth-input-class'

type PasswordInputProps = Omit<
  React.ComponentProps<'input'>,
  'type' | 'className'
> & {
  className?: string
  hasError?: boolean
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput(
    { id, placeholder, autoComplete, className, hasError, ...props },
    ref,
  ) {
    const [visible, setVisible] = useState(false)

    return (
      <div className={cn('relative', className)}>
        <Input
          ref={ref}
          id={id}
          type={visible ? 'text' : 'password'}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={cn(authInputClassName(hasError), 'pr-11')}
          aria-invalid={hasError}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
          aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          tabIndex={-1}
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    )
  },
)
