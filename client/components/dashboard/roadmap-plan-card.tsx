import type { RoadmapItem } from "@/types/domain";

interface RoadmapPlanCardProps {
  roadmap: RoadmapItem[];
}

export function RoadmapPlanCard({ roadmap }: RoadmapPlanCardProps) {
  const visibleItems = roadmap.slice(0, 3);

  return (
    <section className="rounded-[18px] border border-[#dbe4f4] bg-white p-5 shadow-[0_8px_20px_-18px_rgba(17,43,89,0.3)]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-heading text-[15px] font-bold text-[#102b55]">
          Action Roadmap
        </h2>
        <span className="rounded-[8px] bg-[#e8f0ff] px-3 py-1 text-[11px] font-semibold text-[#4f6894]">
          Step {Math.min(visibleItems.length, 2)} of {visibleItems.length || 1}
        </span>
      </div>

      <div className="mt-5 space-y-4">
        {visibleItems.map((item, index) => {
          const dotColor =
            index === 0 ? "#72d1ba" : index === 1 ? "#4d6388" : "#d8dde8";
          const statusText =
            index === 0 ? "Completed" : index === 1 ? "Current Step" : "Upcoming";

          return (
            <div key={`${item.timeline}-${item.task}-${index}`} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className="mt-1 h-3 w-3 rounded-full"
                  style={{ backgroundColor: dotColor }}
                />
                {index < visibleItems.length - 1 ? (
                  <span className="mt-1 h-10 w-px bg-[#dbe3f1]" />
                ) : null}
              </div>
              <div>
                <p
                  className={`font-heading text-[15px] font-bold ${
                    index === 2 ? "text-[#9aa5b8]" : "text-[#173b72]"
                  }`}
                >
                  {item.task}
                </p>
                <p className="mt-1 text-[12px] font-semibold text-[#73839e]">
                  {statusText}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
