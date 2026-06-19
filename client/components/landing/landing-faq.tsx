import { ChevronDown } from "lucide-react";

import { faqItems } from "@/components/landing/data";

export function LandingFaq() {
  return (
    <section className="bg-[#f7f8fc]">
      <div className="mx-auto w-full max-w-[980px] px-6 py-[72px] lg:px-2">
        <div className="text-center">
          <h2 className="font-heading text-[36px] font-bold tracking-[-0.03em] text-[#173b72]">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="mt-12 space-y-4">
          {faqItems.map((item) => (
            <details
              key={item.question}
              className="rounded-[14px] border border-[#edf1f6] bg-white px-6 py-5 shadow-[0_4px_14px_rgba(20,47,88,0.04)]"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-heading text-[20px] font-bold tracking-[-0.03em] text-[#173b72]">
                {item.question}
                <ChevronDown className="h-5 w-5 shrink-0 text-[#6f7b91]" />
              </summary>
              <p className="mt-4 max-w-[760px] text-[14px] leading-[1.85] text-[#73829a]">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
