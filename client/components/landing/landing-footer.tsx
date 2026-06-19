import Image from "next/image";
import Link from "next/link";

import logo from "@/assets/logo.png";

export function LandingFooter() {
  return (
    <footer className="border-t border-[#dbe2f0] bg-[#d8e4ff]">
      <div className="mx-auto flex w-11/12 max-w-[1440px] flex-col items-center py-10 text-center">
        <Link href="/" className="flex items-center gap-2.5 text-[#173b72]">
          <Image
            src={logo}
            alt="Civic Bridge AI logo"
            className="h-8 w-8 object-contain"
          />
          <span className="font-heading text-[22px] font-bold tracking-[-0.03em] sm:text-[23px]">
            Civic Bridge AI
          </span>
        </Link>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-5 text-[12px] text-[#5d6b84]">
          <a href="#">Terms of Service</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Resource Directory</a>
          <a href="#">Contact Support</a>
        </div>

        <p className="mt-5 text-[12px] text-[#6d7890]">
          (c) 2024 Civic Bridge AI. Ensuring stability through crisis.
        </p>
      </div>
    </footer>
  );
}
