"use client";

import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  LayoutDashboard,
  LineChart,
  NotebookPen,
  Sparkles,
  Wrench,
} from "lucide-react";
import { usePathname } from "next/navigation";

import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";

const mainItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/assessments/new", label: "New Assessment", icon: NotebookPen },
];

const placeholderItems = [
  { label: "Roadmap", icon: Sparkles },
  { label: "Resources", icon: LineChart },
  { label: "Settings", icon: Wrench },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-[260px] shrink-0 flex-col overflow-hidden border-r border-[#d9deea] bg-[#fdfdff] md:flex">
      <div className="px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#173b72] text-white">
            <Image
              src={logo}
              alt="CivicBridge AI logo"
              className="h-[26px] w-[26px] object-contain"
            />
          </div>
          <div>
            <p className="font-heading text-[1.15rem] font-bold leading-tight text-[#173b72]">
              CivicBridge AI
            </p>
            <p className="text-xs text-[#7c879e]">
              Crisis Support System
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-4 py-4">
        <div className="mb-5 rounded-xl bg-[#c44332] px-4 py-3 text-sm font-semibold text-white">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Emergency Help
          </div>
        </div>

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

        <div className="mt-6 space-y-2">
          {placeholderItems.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#7c879e]"
              >
                <Icon className="h-4 w-4" />
                {item.label}
                <span className="ml-auto rounded-full bg-[#f1f5fc] px-2 py-1 text-[11px] uppercase tracking-[0.12em]">
                  Soon
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-auto border-t border-[#e6ebf4] px-2 pt-5">
          <div className="rounded-xl px-2 py-3 text-sm text-[#49556d]">
            <p className="font-semibold text-[#173b72]">Foundation active</p>
            <p className="mt-1 leading-6 text-[#7c879e]">
              Shared auth, routing, and API bootstrap are wired for the Stitch
              screens.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
