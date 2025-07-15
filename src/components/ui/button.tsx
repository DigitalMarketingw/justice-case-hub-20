
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-all duration-200 focus-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "btn-primary",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-lg hover:scale-[1.02] rounded-full shadow-md",
        outline: "btn-outline",
        secondary: "btn-secondary",
        ghost: "btn-ghost",
        link: "text-primary underline-offset-4 hover:underline rounded-full",
        success: "bg-success text-success-foreground hover:bg-success/90 hover:shadow-lg hover:scale-[1.02] rounded-full shadow-md",
        warning: "bg-warning text-warning-foreground hover:bg-warning/90 hover:shadow-lg hover:scale-[1.02] rounded-full shadow-md",
        gradient: "gradient-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-[1.02] rounded-full",
      },
      size: {
        default: "h-11 px-6 py-2.5",
        sm: "h-9 px-4 py-2 text-xs",
        lg: "h-12 px-8 py-3",
        icon: "h-11 w-11",
        xl: "h-14 px-10 py-4 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
