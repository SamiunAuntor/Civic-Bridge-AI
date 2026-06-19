import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-secondary focus:ring-2 focus:ring-secondary/15",
      className,
    )}
    {...props}
  />
));

Input.displayName = "Input";
