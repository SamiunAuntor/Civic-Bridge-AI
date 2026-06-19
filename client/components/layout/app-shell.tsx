"use client";

import { Menu } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { TopHeader } from "@/components/layout/top-header";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#171d31] px-3 py-3 md:px-5 md:py-5">
      <div className="mx-auto flex min-h-[calc(100vh-24px)] max-w-[1820px] overflow-hidden rounded-[34px] border border-[#3b4560] bg-[#f6f8fd] md:min-h-[calc(100vh-40px)]">
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
            className="scrollbar-subtle flex-1 overflow-y-auto bg-[#f6f8fd] px-4 pb-24 pt-5 md:px-5 md:pb-6"
          >
            {children}
          </motion.main>
        </div>
      </div>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </div>
  );
}
