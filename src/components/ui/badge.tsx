import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-to-br from-ocean-500 to-ocean-600 text-white shadow-ocean-sm",
        secondary:
          "border-pearl-200 bg-pearl-100 text-charcoal-700",
        destructive:
          "border-transparent bg-gradient-to-br from-red-600 to-red-500 text-white shadow-sm",
        success:
          "border-transparent bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-sm",
        coral:
          "border-transparent bg-gradient-to-br from-coral-500 to-coral-600 text-white shadow-coral-sm",
  outline: "border-pearl-300 text-charcoal-700 bg-white/50 backdrop-blur-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
