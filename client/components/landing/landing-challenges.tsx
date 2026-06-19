import { challengeCards } from "@/components/landing/data";

export function LandingChallenges() {
  return (
    <section className="border-t border-[#eef1f6] bg-white">
      <div className="mx-auto w-full max-w-[1180px] px-6 py-[70px] lg:px-2">
        <div className="text-center">
          <h2 className="font-heading text-[36px] font-bold tracking-[-0.03em] text-[#173b72]">
            Addressing Multi-Dimensional Challenges
          </h2>
          <p className="mx-auto mt-3 max-w-[720px] text-[15px] leading-7 text-[#8491a6]">
            We untangle the complexities of overlapping life events to provide
            focused guidance.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-4">
          {challengeCards.map((card) => {
            const Icon = card.icon;

            return (
              <article
                key={card.title}
                className="rounded-[16px] border border-[#eef1f6] bg-white px-6 py-6 shadow-[0_4px_14px_rgba(20,47,88,0.04)]"
                style={{ borderLeft: `3px solid ${card.accent}` }}
              >
                <Icon
                  className="mb-5 h-[18px] w-[18px]"
                  color={card.iconColor}
                  strokeWidth={1.9}
                />
                <p className="text-[10px] font-semibold tracking-[0.18em] text-[#98a3b6]">
                  {card.eyebrow}
                </p>
                <h3 className="mt-2 font-heading text-[27px] font-bold tracking-[-0.03em] text-[#173b72]">
                  {card.title}
                </h3>
                <p className="mt-3 text-[14px] leading-[1.8] text-[#71809b]">
                  {card.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
