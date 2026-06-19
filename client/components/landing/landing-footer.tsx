import Image from "next/image";

import logo from "@/assets/logo.png";

export function LandingFooter() {
  return (
    <footer className="border-t border-[#dbe2f0] bg-[#d8e4ff]">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col items-center px-6 py-10 text-center lg:px-2">
        <div className="flex items-center gap-2.5 text-[#173b72]">
          <Image
            src={logo}
            alt="CivicBridge AI logo"
            className="h-8 w-8 object-contain"
          />
          <span className="font-heading text-[22px] font-bold tracking-[-0.03em] sm:text-[23px]">
            CivicBridge AI
          </span>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-5 text-[12px] text-[#5d6b84]">
          <a href="#">Terms of Service</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Resource Directory</a>
          <a href="#">Contact Support</a>
        </div>

        <p className="mt-5 text-[12px] text-[#6d7890]">
          (c) 2024 CivicBridge AI. Ensuring stability through crisis.
        </p>
      </div>
    </footer>
  );
}
