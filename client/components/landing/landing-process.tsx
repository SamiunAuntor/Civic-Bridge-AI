import Image from "next/image";
import { ArrowRight } from "lucide-react";

import landingImageTwo from "@/assets/landing-image-2.png";
import { processSteps } from "@/components/landing/data";

export function LandingProcess() {
  return (
    <section className="bg-[#f7f8fc]">
      <div className="mx-auto grid w-11/12 max-w-[1440px] gap-10 py-[78px] lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <h2 className="font-heading text-[38px] font-bold tracking-[-0.03em] text-[#173b72]">
            A Clear Path Forward
          </h2>
          <p className="mt-5 max-w-[320px] text-[15px] leading-[1.9] text-[#7f8ba1]">
            Our process is designed to reduce cognitive load during high-stress
            situations, providing only the next logical step.
          </p>
          <div className="mt-12 overflow-hidden rounded-[16px] border border-[#e3e8f2] bg-[#edf2fb]">
            <Image
              src={landingImageTwo}
              alt="Illustration showing a guided crisis support pathway"
              className="h-auto w-full"
              sizes="(max-width: 1024px) 100vw, 420px"
            />
          </div>
        </div>

        <div className="relative">
          <div className="absolute left-[18px] top-[18px] hidden h-[76%] w-px bg-[#dfe6f2] lg:block" />
          <div className="space-y-5">
            {processSteps.map((step, index) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.title}
                  className="grid gap-4 lg:grid-cols-[44px_1fr]"
                >
                  <div className="hidden lg:flex">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e8eefc] text-[13px] font-semibold text-[#173b72]">
                      {index < 3 ? (
                        index + 1
                      ) : (
                        <ArrowRight className="h-3.5 w-3.5 rotate-90" />
                      )}
                    </div>
                  </div>
                  <div className="rounded-[16px] border border-[#edf1f6] bg-white px-6 py-5 shadow-[0_4px_14px_rgba(20,47,88,0.04)]">
                    <div className="flex items-center gap-2 text-[#173b72]">
                      <Icon className="h-4 w-4" strokeWidth={1.9} />
                      <h3 className="font-heading text-[24px] font-bold tracking-[-0.03em]">
                        {step.title}
                      </h3>
                    </div>
                    <p className="mt-3 text-[14px] leading-[1.85] text-[#76839a]">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
