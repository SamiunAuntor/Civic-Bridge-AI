import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full rounded-[24px] border border-border bg-surface px-4 py-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-secondary focus:ring-2 focus:ring-secondary/15",
      className,
    )}
    {...props}
  />
));

Textarea.displayName = "Textarea";
