"use client";

import Image from "next/image";
import Link from "next/link";

import logo from "@/assets/logo.png";

export function AuthSplitShell({
  title,
  subtitle,
  primaryAction,
  socialAction,
  footerPrompt,
  footerLink,
  footerLabel,
  children,
  agreement,
}: {
  title: string;
  subtitle: string;
  primaryAction: React.ReactNode;
  socialAction: React.ReactNode;
  footerPrompt: string;
  footerLink: string;
  footerLabel: string;
  children: React.ReactNode;
  agreement?: React.ReactNode;
}) {
  return (
    <div className="mx-auto grid w-11/12 max-w-[1440px] overflow-hidden bg-white md:grid-cols-[0.92fr_1.08fr]">
      <section className="flex items-center justify-center px-8 py-12 md:px-12 lg:px-14">
        <div className="w-full max-w-[360px]">
          <div className="mb-8">
            <Image
              src={logo}
              alt="Civic Bridge AI logo"
              className="h-[42px] w-[42px] object-contain"
              priority
            />
          </div>

          <div>
            <h1 className="font-heading text-[44px] font-bold leading-[1.02] tracking-[-0.045em] text-[#173b72]">
              {title}
            </h1>
            <p className="mt-4 max-w-[320px] text-[16px] leading-[1.75] text-[#5f6f8a]">
              {subtitle}
            </p>
          </div>

          <div className="mt-10 space-y-5">{children}</div>

          {agreement ? <div className="mt-5">{agreement}</div> : null}

          <div className="mt-5">{primaryAction}</div>

          <div className="mt-9 flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8c98ab]">
            <span className="h-px flex-1 bg-[#d9deea]" />
            Or continue with
            <span className="h-px flex-1 bg-[#d9deea]" />
          </div>

          <div className="mt-9">{socialAction}</div>

          <p className="mt-8 text-center text-[15px] text-[#71809b]">
            {footerPrompt}{" "}
            <Link href={footerLink} className="font-semibold text-[#173b72]">
              {footerLabel}
            </Link>
          </p>
        </div>
      </section>

      <aside className="relative hidden min-h-[760px] overflow-hidden md:block">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBDwmJzd6vfqF4eUtkAhDhBs_hA0-nr6fFy32BQCH2kZ9-ANzBPBJ7x_9Wxi7nQigbu3SzYLFpVkUZaF5oBtm5DymFHZVOFTmTkaA-7_r9G6mpIXQbLa_v-fPnZU05hmSM3BP6qg4O7RuJLU5EpWwUnYPauD3YDCC5_1Ia-qBE4xtr0_RLb6H-NXEbX-HrxsLus5Fn6wG2B0z_PR6ofJ9Ic6jsD1_tn_zmXb_kHWOEDyfX2FHWgf8WOQBFxxlQ0cCi6SdlgpeGqRtc')",
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(240,244,252,0.14)_0%,rgba(24,46,85,0.42)_58%,rgba(20,41,77,0.84)_100%)]" />

        <div className="relative flex h-full items-end p-10">
          <div className="max-w-[380px]">
            <h2 className="font-heading text-[54px] font-bold leading-[1.02] tracking-[-0.05em] text-white">
              Your journey to stability starts here.
            </h2>
            <p className="mt-6 text-[18px] leading-[1.9] text-white/86">
              Civic Bridge AI provides the tools and expert guidance to navigate
              life&apos;s toughest transitions with confidence and clarity.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
