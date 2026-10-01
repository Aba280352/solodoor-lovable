import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * SOLODOOR buttons never change colour on hover — they grow slightly (scale 1.05
 * over 480ms). `default` is the clay CTA, `secondary` the sage CTA.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-md font-medium leading-[1.6] cursor-pointer transition-transform duration-[480ms] ease-standard hover:scale-105 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        light: "border border-background bg-background text-foreground",
        secondary: "border border-secondary bg-secondary text-secondary-foreground",
        outline:
          "border border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-background",
        ghost: "text-foreground hover:scale-100",
        link: "text-foreground underline-offset-4 hover:scale-100 hover:underline",
      },
      size: {
        default: "fs-18 px-10 py-[1.0625rem]",
        sm: "fs-15 h-9 px-4",
        card: "fs-16 px-2.5 py-[0.8125rem] hover:scale-[1.03]",
        xl: "fs-20 rounded-lg px-12 py-[1.1875rem]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
