import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider transition-colors",
  {
    variants: {
      variant: {
        default: "bg-stone-900 text-stone-50",
        secondary: "bg-stone-100 text-stone-700",
        brand: "bg-amber-100 text-amber-800 border border-amber-200",
        featured: "bg-amber-500 text-white",
        outline: "border border-stone-300 text-stone-600",
        low: "bg-orange-50 text-orange-700 border border-orange-200",
        out: "bg-red-50 text-red-700 border border-red-200",
        in: "bg-emerald-50 text-emerald-700 border border-emerald-200",
        men: "bg-slate-100 text-slate-700",
        women: "bg-rose-50 text-rose-700 border border-rose-100",
        unisex: "bg-violet-50 text-violet-700 border border-violet-100",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
