"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  CirclePlay,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import landingBanner from "@/assets/landing-banner.png";
import landingBannerTwo from "@/assets/landing-banner-2.png";
import landingBannerThree from "@/assets/landing-banner-3.png";
import landingBannerFour from "@/assets/landing-banner-4.png";

const heroSlides = [
  {
    image: landingBanner,
    alt: "Person seated at a laptop beginning a guided support session",
    label: "Plan Initiated",
    progress: 25,
  },
  {
    image: landingBannerTwo,
    alt: "Guided support session progressing with structured crisis planning",
    label: "Signals Mapped",
    progress: 50,
  },
  {
    image: landingBannerThree,
    alt: "Crisis support plan being generated for the user",
    label: "Plan Generated",
    progress: 75,
  },
  {
    image: landingBannerFour,
    alt: "Completed support workflow with a ready action plan",
    label: "Pathway Ready",
    progress: 100,
  },
] as const;

export function LandingHero() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 3200);

    return () => window.clearInterval(intervalId);
  }, []);

  const currentSlide = heroSlides[activeSlide];

  return (
    <section className="mx-auto grid w-11/12 max-w-[1440px] gap-10 pb-[70px] pt-[64px] lg:grid-cols-[1.02fr_0.98fr]">
      <div className="flex flex-col justify-center">
        <div className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-[#e5e9f2] bg-white px-3 py-1.5 text-[10px] font-semibold text-[#7b8ca8] shadow-[0_2px_12px_rgba(26,54,93,0.04)]">
          <ShieldCheck
            className="h-3.5 w-3.5 text-[#7aa9ff]"
            strokeWidth={1.8}
          />
          Secure &amp; Confidential
        </div>

        <h1 className="max-w-[540px] font-heading text-[54px] font-bold leading-[1.06] tracking-[-0.04em] text-[#173b72]">
          When life feels
          <br />
          overwhelming,
          <br />
          know what to do next.
        </h1>

        <p className="mt-7 max-w-[560px] text-[18px] leading-[1.85] text-[#62728f]">
          Civic Bridge AI turns complex life crises into clear, prioritized
          action plans. Navigate uncertainty with institutional-grade
          intelligence and human-centered design.
        </p>

        <div className="mt-9 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/register"
            className="inline-flex h-[56px] min-w-[210px] items-center justify-center gap-3 rounded-[12px] bg-[#173b72] px-6 text-[16px] font-semibold text-white"
          >
            Start New Case
            <ArrowRight className="h-4 w-4" strokeWidth={2.1} />
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex h-[56px] min-w-[210px] items-center justify-center gap-3 rounded-[12px] border border-[#173b72] bg-white px-6 text-[16px] font-semibold text-[#173b72]"
          >
            <CirclePlay className="h-4 w-4" strokeWidth={1.9} />
            View Demo
          </Link>
        </div>
      </div>

      <div className="flex items-center justify-center lg:justify-end">
        <div className="relative h-[420px] w-full max-w-[520px] overflow-hidden rounded-[20px] bg-[#edf2fb]">
          {heroSlides.map((slide, index) => (
            <Image
              key={slide.label}
              src={slide.image}
              alt={slide.alt}
              fill
              priority={index === 0}
              className={`object-cover transition-opacity duration-700 ${
                index === activeSlide ? "opacity-100" : "opacity-0"
              }`}
              sizes="(max-width: 1024px) 100vw, 520px"
            />
          ))}

          <div className="absolute bottom-[28px] right-[24px] w-[188px] rounded-[16px] border border-[#dbe2ed] bg-white px-4 py-3 shadow-[0_12px_30px_-18px_rgba(22,41,77,0.28)]">
            <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold text-[#3ebea9]">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={1.9} />
              {currentSlide.label}
            </div>
            <div className="h-[6px] rounded-full bg-[#edf1f7]">
              <div
                className="h-[6px] rounded-full bg-[#7be4d7] transition-all duration-700"
                style={{ width: `${currentSlide.progress}%` }}
              />
            </div>
          </div>

          <div className="absolute bottom-[18px] left-1/2 flex -translate-x-1/2 gap-2">
            {heroSlides.map((slide, index) => (
              <button
                key={slide.label}
                type="button"
                aria-label={`Show ${slide.label.toLowerCase()} slide`}
                onClick={() => setActiveSlide(index)}
                className={`h-2.5 rounded-full transition-all ${
                  index === activeSlide
                    ? "w-7 bg-white"
                    : "w-2.5 bg-white/55"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
