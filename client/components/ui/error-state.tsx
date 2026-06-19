"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ErrorState({
  title,
  message,
  actionLabel,
  onAction,
  fullScreen = false,
}: {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  fullScreen?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-danger/20 bg-panel px-6 py-10 text-center shadow-soft",
        fullScreen && "flex min-h-screen items-center justify-center",
      )}
    >
      <div className="mx-auto max-w-xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-danger-soft text-danger">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="mt-5 font-heading text-3xl font-bold text-foreground">
          {title}
        </h2>
        <p className="mt-3 text-muted-foreground">{message}</p>
        {actionLabel && onAction ? (
          <div className="mt-5">
            <Button onClick={onAction}>{actionLabel}</Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
