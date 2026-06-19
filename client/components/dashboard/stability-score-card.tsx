interface StabilityScoreCardProps {
  score: number;
  summary: string;
}

export function StabilityScoreCard({
  score,
  summary,
}: StabilityScoreCardProps) {
  const normalizedScore = Math.max(0, Math.min(100, score));
  const progress = Math.max(8, normalizedScore);

  return (
    <section className="rounded-[18px] border border-[#dbe4f4] bg-white p-5 shadow-[0_8px_20px_-18px_rgba(17,43,89,0.3)]">
      <h2 className="font-heading text-[15px] font-bold text-[#102b55]">
        Stability Score
      </h2>

      <div className="mt-6 flex justify-center">
        <div
          className="relative flex h-[132px] w-[132px] items-center justify-center rounded-full"
          style={{
            background: `conic-gradient(#b73429 ${progress}%, #d9e4ff ${progress}% 100%)`,
          }}
        >
          <div className="flex h-[96px] w-[96px] flex-col items-center justify-center rounded-full bg-white">
            <span className="font-heading text-[24px] font-bold text-[#b73429]">
              {normalizedScore}
            </span>
            <span className="text-[12px] font-semibold text-[#173b72]">
              / 100
            </span>
          </div>
        </div>
      </div>

      <p className="mt-6 text-center text-[13px] leading-[1.8] text-[#596a86]">
        {summary}
      </p>
    </section>
  );
}
