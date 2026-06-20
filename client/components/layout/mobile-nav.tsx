"use client";

import Image from "next/image";
import Link from "next/link";
import {
  BriefcaseBusiness,
  Cog,
  Home,
  LayoutDashboard,
  LogOut,
  X,
} from "lucide-react";
import { usePathname } from "next/navigation";

import logo from "@/assets/logo.png";
import { useAuth } from "@/hooks/use-auth";
import { frontendFeatures } from "@/lib/features";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/assessments/new", label: "New Case", icon: Home },
  ...(frontendFeatures.enableCaseHistory
    ? [{ href: "/cases", label: "Cases", icon: BriefcaseBusiness }]
    : []),
  { href: "/settings", label: "Settings", icon: Cog },
];

export function MobileNav({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { signOutUser } = useAuth();

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 bg-[#081120]/45 backdrop-blur-sm transition",
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      <div
        className={cn(
          "absolute left-0 top-0 h-full w-[86%] max-w-sm border-r border-border/70 bg-panel p-5 shadow-panel transition-transform",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" onClick={onClose} className="flex items-center gap-3">
            <Image
              src={logo}
              alt="Civic Bridge AI logo"
              className="h-11 w-11 object-contain"
            />
            <div>
              <p className="font-heading text-[1.05rem] font-bold leading-tight text-primary">
                Civic Bridge AI
              </p>
              <p className="text-sm text-muted-foreground">Support System</p>
            </div>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-surface text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface text-muted-foreground hover:text-primary",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={async () => {
            await signOutUser();
            onClose();
          }}
          className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3 font-semibold text-primary"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
