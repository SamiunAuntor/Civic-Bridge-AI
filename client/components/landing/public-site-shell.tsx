import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingNavbar } from "@/components/landing/landing-navbar";

export function PublicSiteShell({
  children,
  mainClassName,
}: {
  children: React.ReactNode;
  mainClassName?: string;
}) {
  return (
    <div className="min-h-screen bg-[#f7f8fc] text-[#173b72]">
      <LandingNavbar />
      <main className={mainClassName}>{children}</main>
      <LandingFooter />
    </div>
  );
}
