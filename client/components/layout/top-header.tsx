"use client";

import { usePathname } from "next/navigation";
import { UserMenu } from "@/components/layout/user-menu";

const routeTitles: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": {
    title: "Overview",
    subtitle: "Here is your current stability summary and active tasks.",
  },
  "/assessments/new": {
    title: "New Assessment",
    subtitle: "Describe the situation and generate a real support plan.",
  },
  "/roadmap": {
    title: "Roadmap",
    subtitle: "Review the generated next-step recovery plan.",
  },
  "/resources": {
    title: "Resources",
    subtitle: "Matched support resources based on your latest assessment.",
  },
  "/progress": {
    title: "Progress",
    subtitle: "Track simulations and current recovery momentum.",
  },
  "/settings": {
    title: "Settings",
    subtitle: "View your Civic Bridge AI profile and account details.",
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
    title: "Civic Bridge AI",
    subtitle: "Personalized support planning and guided next steps.",
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
