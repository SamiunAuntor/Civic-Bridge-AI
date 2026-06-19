import { LandingChallenges } from "@/components/landing/landing-challenges";
import { LandingCta } from "@/components/landing/landing-cta";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingFaq } from "@/components/landing/landing-faq";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { LandingProcess } from "@/components/landing/landing-process";
import { LandingSecurity } from "@/components/landing/landing-security";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f8fc] text-[#173b72]">
      <LandingNavbar />
      <LandingHero />
      <LandingChallenges />
      <LandingProcess />
      <LandingSecurity />
      <LandingFaq />
      <LandingCta />
      <LandingFooter />
    </main>
  );
}
