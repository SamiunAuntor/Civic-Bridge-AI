import Image from "next/image";
import Link from "next/link";

import logo from "@/assets/logo.png";

export function LandingNavbar() {
  return (
    <header className="border-b border-[#ebedf3] bg-white">
      <div className="mx-auto flex h-[86px] w-full max-w-[1180px] items-center justify-between px-6 lg:px-2">
        <div className="flex items-center gap-3">
          <Image
            src={logo}
            alt="CivicBridge AI logo"
            className="h-9 w-9 object-contain"
            priority
          />
          <div className="font-heading text-[24px] font-bold leading-none tracking-[-0.03em] text-[#173b72] sm:text-[26px]">
            CivicBridge AI
          </div>
        </div>

        <nav className="hidden items-center gap-12 text-[13px] font-medium text-[#6f7b91] md:flex">
          <span className="border-b border-[#173b72] pb-1 text-[#173b72]">
            Solutions
          </span>
          <span>Expertise</span>
          <span>Crisis Support</span>
        </nav>

        <div className="flex items-center gap-5">
          <Link
            href="/login"
            className="hidden text-[13px] font-medium text-[#6f7b91] md:inline-flex"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="inline-flex h-[38px] items-center rounded-full bg-[#173b72] px-5 text-[13px] font-semibold text-white"
          >
            Get Help Now
          </Link>
        </div>
      </div>
    </header>
  );
}
