"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-stone-900 text-stone-50 hover:bg-stone-800 shadow-sm",
        brand:
          "bg-[#C9A84C] text-stone-900 hover:bg-[#b8973f] shadow-sm shadow-amber-900/10",
        outline:
          "border border-stone-400/70 bg-transparent text-stone-900 hover:bg-stone-900 hover:text-white hover:border-stone-900",
        ghost:
          "text-stone-600 hover:bg-stone-100 hover:text-stone-900",
        destructive:
          "bg-red-500 text-white hover:bg-red-600 shadow-sm",
        secondary:
          "bg-stone-100 text-stone-900 hover:bg-stone-200 shadow-sm",
        link:
          "text-amber-700 underline-offset-4 hover:underline p-0 h-auto",
        whatsapp:
          "bg-[#25D366] text-white hover:bg-[#22c55e] shadow-md shadow-green-600/20",
      },
      size: {
        default: "h-10 px-5 py-2 rounded-md text-sm tracking-wide",
        sm: "h-8 px-4 py-1.5 rounded text-xs tracking-wide",
        lg: "h-12 px-8 py-3 rounded-md text-sm tracking-widest uppercase",
        xl: "h-14 px-10 py-4 rounded-md text-base tracking-widest uppercase",
        icon: "h-9 w-9 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
