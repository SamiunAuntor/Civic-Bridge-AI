"use client";

import { useAuth } from "@/hooks/use-auth";

export default function SettingsPage() {
  const { profile, firebaseUser } = useAuth();

  return (
    <section className="rounded-[18px] border border-[#dbe4f4] bg-white p-6 shadow-[0_8px_20px_-18px_rgba(17,43,89,0.3)]">
      <h2 className="font-heading text-[30px] font-bold tracking-[-0.04em] text-[#173b72]">
        Account Settings
      </h2>
      <p className="mt-3 max-w-2xl text-[15px] leading-[1.8] text-[#62728f]">
        Review the account details connected to your Civic Bridge AI experience.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-[16px] border border-[#e6ebf4] bg-[#fbfcff] p-5">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7c8ba4]">
            Full Name
          </p>
          <p className="mt-3 font-heading text-[22px] font-bold text-[#173b72]">
            {profile?.name || firebaseUser?.displayName || "Not provided"}
          </p>
        </div>
        <div className="rounded-[16px] border border-[#e6ebf4] bg-[#fbfcff] p-5">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7c8ba4]">
            Email
          </p>
          <p className="mt-3 font-heading text-[22px] font-bold text-[#173b72]">
            {profile?.email || firebaseUser?.email || "Not provided"}
          </p>
        </div>
        <div className="rounded-[16px] border border-[#e6ebf4] bg-[#fbfcff] p-5">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7c8ba4]">
            Profile ID
          </p>
          <p className="mt-3 break-all text-[14px] font-semibold text-[#173b72]">
            {profile?.id || "Unavailable"}
          </p>
        </div>
        <div className="rounded-[16px] border border-[#e6ebf4] bg-[#fbfcff] p-5">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7c8ba4]">
            Secure Account ID
          </p>
          <p className="mt-3 break-all text-[14px] font-semibold text-[#173b72]">
            {profile?.firebase_uid || firebaseUser?.uid || "Unavailable"}
          </p>
        </div>
      </div>
    </section>
  );
}
