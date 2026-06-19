import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function LandingCta() {
  return (
    <section className="bg-[#f7f8fc] pb-[76px]">
      <div className="mx-auto w-11/12 max-w-[1440px]">
        <div className="rounded-[18px] bg-[#173b72] px-8 py-14 text-center shadow-[0_20px_40px_-24px_rgba(23,59,114,0.55)]">
          <h2 className="font-heading text-[38px] font-bold tracking-[-0.03em] text-white">
            Take the first step toward stability today.
          </h2>
          <p className="mx-auto mt-4 max-w-[700px] text-[16px] leading-[1.9] text-[#c9d7f1]">
            Get your personalized, prioritized action plan in under 5 minutes.
            Completely confidential and free.
          </p>

          <div className="mt-10 flex items-center justify-center">
            <Link
              href="/register"
              className="inline-flex h-[54px] min-w-[220px] items-center justify-center gap-3 rounded-[10px] bg-[#7fb3ff] px-6 text-[15px] font-semibold text-[#173b72]"
            >
              Get Started
              <ArrowRight className="h-4 w-4" strokeWidth={2.1} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
