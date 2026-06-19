import type { LucideIcon } from "lucide-react";

interface RiskSummaryCardProps {
  title: string;
  level: "LOW" | "MEDIUM" | "HIGH";
  description: string;
  icon: LucideIcon;
}

const riskStyles = {
  HIGH: {
    accent: "#b73429",
    label: "HIGH RISK",
    icon: "#e9edf6",
  },
  MEDIUM: {
    accent: "#61a8ff",
    label: "MEDIUM RISK",
    icon: "#e9edf6",
  },
  LOW: {
    accent: "#79d8c7",
    label: "LOW RISK",
    icon: "#e9edf6",
  },
} as const;

export function RiskSummaryCard({
  title,
  level,
  description,
  icon: Icon,
}: RiskSummaryCardProps) {
  const style = riskStyles[level];

  return (
    <article
      className="relative min-h-[135px] rounded-[16px] border border-[#e4eaf5] bg-white p-4 shadow-[0_8px_20px_-18px_rgba(17,43,89,0.24)]"
      style={{ borderLeft: `3px solid ${style.accent}` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.16em] text-[#8e99ad]">
            {style.label}
          </p>
          <h3 className="mt-2 font-heading text-[18px] font-bold text-[#102b55]">
            {title}
          </h3>
        </div>

        <Icon className="h-10 w-10 text-[#e3e6ed]" strokeWidth={1.6} />
      </div>

      <p className="mt-6 max-w-[220px] text-[13px] leading-[1.7] text-[#4f607d]">
        {description}
      </p>
    </article>
  );
}
