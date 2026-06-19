"use client";

import { usePathname } from "next/navigation";
import { UserMenu } from "@/components/layout/user-menu";

const routeTitles: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": {
    title: "Overview",
    subtitle: "Your current stability foundation and protected app shell.",
  },
  "/assessments/new": {
    title: "New Assessment",
    subtitle: "Structured intake form wired to the real backend contract.",
  },
};

export function TopHeader({
  menuButton,
}: {
  menuButton: React.ReactNode;
}) {
  const pathname = usePathname();
  const routeMeta = Object.entries(routeTitles).find(([route]) =>
    pathname.startsWith(route),
  )?.[1] ?? {
    title: "CivicBridge AI",
    subtitle: "Frontend foundation",
  };

  return (
    <header className="border-b border-[#d9deea] bg-[#fdfdff] px-4 py-4 md:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          {menuButton}
          <div className="min-w-0">
            <h1 className="truncate font-heading text-[2rem] font-bold text-[#0d3366]">
              {routeMeta.title}
            </h1>
            <p className="truncate text-sm text-[#7c879e]">
              {routeMeta.subtitle}
            </p>
          </div>
        </div>

        <UserMenu />
      </div>
    </header>
  );
}
