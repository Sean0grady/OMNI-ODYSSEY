import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Controls in the label vocabulary: condensed caps, tight corners, solid ink.
 * A grading label has no rounded pill on it, and neither does this.
 */
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-[2px] border border-transparent bg-clip-padding font-semibold whitespace-nowrap uppercase transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/88",
        outline:
          "border-foreground/30 bg-transparent hover:border-foreground/60 hover:bg-foreground/[0.04] aria-expanded:bg-foreground/[0.06] dark:hover:bg-foreground/[0.08]",
        secondary:
          "bg-label-stock text-foreground hover:bg-label-stock/85 aria-expanded:bg-label-stock/85",
        ghost:
          "hover:bg-foreground/[0.06] aria-expanded:bg-foreground/[0.06] dark:hover:bg-foreground/[0.1]",
        destructive:
          "bg-destructive text-white hover:bg-destructive/88 focus-visible:ring-destructive/30",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-8 gap-1.5 px-3 text-[0.72rem] tracking-[0.07em] has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
        xs: "h-6 gap-1 px-2 text-[0.62rem] tracking-[0.06em] [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 px-2.5 text-[0.66rem] tracking-[0.065em] [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-10 gap-2 px-5 text-[0.8rem] tracking-[0.08em]",
        icon: "size-8",
        "icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  nativeButton,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      nativeButton={nativeButton ?? !props.render}
      className={cn(buttonVariants({ variant, size, className }))}
      style={{ fontStretch: "84%" }}
      {...props}
    />
  )
}

export { Button, buttonVariants }
