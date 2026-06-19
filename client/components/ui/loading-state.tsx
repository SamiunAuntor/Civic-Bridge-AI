import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoadingState({
  title,
  message = "Please hold on while the interface prepares your next view.",
  fullScreen = false,
}: {
  title: string;
  message?: string;
  fullScreen?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-border bg-panel px-6 py-10 text-center shadow-soft",
        fullScreen && "flex min-h-screen items-center justify-center",
      )}
    >
      <div className="mx-auto max-w-xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-surface-strong text-primary">
          <LoaderCircle className="h-6 w-6 animate-spin" />
        </div>
        <h2 className="mt-5 font-heading text-3xl font-bold text-foreground">
          {title}
        </h2>
        <p className="mt-3 text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
