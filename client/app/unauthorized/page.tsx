import Link from "next/link";
import { UnauthorizedState } from "@/components/ui/unauthorized-state";

export default function UnauthorizedPage() {
  return (
    <UnauthorizedState
      title="You need to sign in first"
      message="This area is protected and requires a Firebase-authenticated session."
      action={
        <Link
          href="/login"
          className="inline-flex rounded-2xl bg-primary px-4 py-2 font-semibold text-primary-foreground"
        >
          Go to login
        </Link>
      }
      fullScreen
    />
  );
}
