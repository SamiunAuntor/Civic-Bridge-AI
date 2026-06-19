import { Inbox } from "lucide-react";

export function EmptyState({
  title,
  message,
  action,
}: {
  title: string;
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-[28px] border border-dashed border-border bg-surface px-6 py-10 text-center shadow-soft">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-surface-strong text-primary">
        <Inbox className="h-6 w-6" />
      </div>
      <h2 className="mt-5 font-heading text-2xl font-bold text-foreground">
        {title}
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{message}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
