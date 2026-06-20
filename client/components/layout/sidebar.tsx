"use client";

import Image from "next/image";
import Link from "next/link";
import {
  BriefcaseBusiness,
  Cog,
  LayoutDashboard,
  NotebookPen,
} from "lucide-react";
import { usePathname } from "next/navigation";

import logo from "@/assets/logo.png";
import { UserMenu } from "@/components/layout/user-menu";
import { frontendFeatures } from "@/lib/features";
import { cn } from "@/lib/utils";

const mainItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/assessments/new", label: "New Case", icon: NotebookPen },
  ...(frontendFeatures.enableCaseHistory
    ? [{ href: "/cases", label: "Cases", icon: BriefcaseBusiness }]
    : []),
  { href: "/settings", label: "Settings", icon: Cog },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 flex-col border-r border-[#d9deea] bg-[#fdfdff] md:flex">
      <div className="px-6 py-6">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src={logo}
            alt="Civic Bridge AI logo"
            className="h-[42px] w-[42px] object-contain"
          />
          <div>
            <p className="font-heading text-[1.15rem] font-bold leading-tight text-[#173b72]">
              Civic Bridge AI
            </p>
            <p className="text-xs text-[#7c879e]">
              Crisis Support System
            </p>
          </div>
        </Link>
      </div>

      <div className="flex flex-1 flex-col px-4 py-4">
        <nav className="space-y-2">
          {mainItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition",
                  isActive
                    ? "bg-[#8fc2ff] text-[#173b72]"
                    : "text-[#49556d] hover:bg-[#eef4ff] hover:text-[#173b72]",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-[#d9deea] px-2 pt-6">
          <UserMenu />
        </div>
      </div>
    </aside>
  );
}
