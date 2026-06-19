"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { LoadingState } from "@/components/ui/loading-state";
import { UnauthorizedState } from "@/components/ui/unauthorized-state";
import { useAuth } from "@/hooks/use-auth";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { status, isFirebaseReady } = useAuth();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [pathname, router, status]);

  if (status === "loading") {
    return <LoadingState title="Checking your session" fullScreen />;
  }

  if (!isFirebaseReady) {
    return (
      <UnauthorizedState
        title="Firebase client configuration is missing"
        message="Add the public Firebase values in client/.env.example before using protected routes."
        fullScreen
      />
    );
  }

  if (status !== "authenticated") {
    return <LoadingState title="Redirecting to sign in" fullScreen />;
  }

  return <AppShell>{children}</AppShell>;
}
