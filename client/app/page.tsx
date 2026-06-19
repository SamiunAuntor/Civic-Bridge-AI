import { LandingChallenges } from "@/components/landing/landing-challenges";
import { LandingCta } from "@/components/landing/landing-cta";
import { LandingFaq } from "@/components/landing/landing-faq";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingProcess } from "@/components/landing/landing-process";
import { LandingSecurity } from "@/components/landing/landing-security";
import { PublicSiteShell } from "@/components/landing/public-site-shell";

export default function Home() {
  return (
    <PublicSiteShell>
      <LandingHero />
      <LandingChallenges />
      <LandingProcess />
      <LandingSecurity />
      <LandingFaq />
      <LandingCta />
    </PublicSiteShell>
  );
}
