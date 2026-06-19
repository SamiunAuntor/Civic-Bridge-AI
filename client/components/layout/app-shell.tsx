"use client";

import { Menu } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { TopHeader } from "@/components/layout/top-header";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const isDashboardRoute = pathname === "/dashboard";

  return (
    <div className="min-h-screen bg-[#171d31]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1440px] overflow-hidden bg-[#f5f7fd]">
        <Sidebar />

        <div className="flex min-h-full flex-1 flex-col overflow-hidden">
          <TopHeader
            menuButton={
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#d9deea] bg-white text-[#0d3366] md:hidden"
                aria-label="Open navigation"
              >
                <Menu className="h-5 w-5" />
              </button>
            }
          />

          <motion.main
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28 }}
            className="scrollbar-subtle flex-1 overflow-y-auto bg-[#f5f7fd] px-4 pb-24 pt-5 md:px-6 md:pb-8"
          >
            {isDashboardRoute ? (
              children
            ) : (
              <div className="mx-auto w-11/12 max-w-[1440px]">{children}</div>
            )}
          </motion.main>
        </div>
      </div>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </div>
  );
}
