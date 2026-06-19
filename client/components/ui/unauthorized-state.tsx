import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export function UnauthorizedState({
  title,
  message,
  action,
  fullScreen = false,
}: {
  title: string;
  message: string;
  action?: React.ReactNode;
  fullScreen?: boolean;
}) {
  return (
    <div
      className={cn(
        fullScreen
          ? "flex min-h-screen items-center justify-center bg-[#f5f7fd] px-6 py-10 text-center text-[#0b1c30]"
          : "rounded-[28px] border border-border bg-panel px-6 py-10 text-center shadow-soft",
      )}
    >
      <div className="mx-auto max-w-xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-surface-strong text-primary">
          <Lock className="h-6 w-6" />
        </div>
        <h2 className="mt-5 font-heading text-3xl font-bold text-[#0b1c30]">
          {title}
        </h2>
        <p className="mt-3 text-[#71809b]">{message}</p>
        {action ? <div className="mt-5">{action}</div> : null}
      </div>
    </div>
  );
}
