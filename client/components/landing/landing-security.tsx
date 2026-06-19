import { securityFeatures } from "@/components/landing/data";

export function LandingSecurity() {
  return (
    <section className="bg-[#eaf1ff]">
      <div className="mx-auto w-11/12 max-w-[1440px] py-[76px]">
        <div className="text-center">
          <h2 className="font-heading text-[34px] font-bold tracking-[-0.03em] text-[#173b72] sm:text-[36px]">
            Institutional-Grade Security
          </h2>
          <p className="mx-auto mt-3 max-w-[680px] text-[15px] leading-7 text-[#7d8aa0]">
            Your trust is our most valuable asset. We protect your data with
            the highest standards of digital safety.
          </p>
        </div>

        <div className="mt-12 grid w-full gap-4 md:grid-cols-2 lg:grid-cols-4">
          {securityFeatures.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                className="rounded-[16px] border border-[#edf2fb] bg-white px-5 py-7 text-center shadow-[0_4px_14px_rgba(20,47,88,0.04)]"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#e8f0ff] text-[#5f8fe6]">
                  <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                </div>
                <h3 className="mt-5 font-heading text-[18px] font-bold tracking-[-0.03em] text-[#173b72] sm:text-[20px]">
                  {feature.title}
                </h3>
                <p className="mt-3 text-[13px] leading-[1.8] text-[#73829a] sm:text-[14px]">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
