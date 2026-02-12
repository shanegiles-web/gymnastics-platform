import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Dot } from 'lucide-react'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'border border-border-DEFAULT bg-surface-page text-text-primary',
        success: 'border border-status-success bg-green-50 text-status-success',
        warning: 'border border-status-warning bg-amber-50 text-status-warning',
        error: 'border border-status-error bg-red-50 text-status-error',
        info: 'border border-status-info bg-blue-50 text-status-info',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> {
  showDot?: boolean
}

function Badge({ className, variant, showDot = false, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {showDot && <Dot className="h-3 w-3 fill-current" />}
      <span>{children}</span>
    </div>
  )
}

export { Badge, badgeVariants }
