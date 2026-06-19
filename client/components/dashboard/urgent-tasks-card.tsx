import type { Priority } from "@/types/domain";

interface UrgentTasksCardProps {
  priorities: Priority[];
}

const priorityRowStyles = [
  {
    bg: "#fff5f1",
    border: "#f3d6cb",
    due: "#ca5c49",
  },
  {
    bg: "#eef4ff",
    border: "#d2ddf7",
    due: "#4d6690",
  },
];

function deriveDueLabel(index: number) {
  return index === 0 ? "Due in 2 days" : "Due in 5 days";
}

export function UrgentTasksCard({ priorities }: UrgentTasksCardProps) {
  return (
    <section className="rounded-[18px] border border-[#dbe4f4] bg-white p-5 shadow-[0_8px_20px_-18px_rgba(17,43,89,0.3)]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-heading text-[15px] font-bold text-[#102b55]">
          Urgent Tasks
        </h2>
        <span className="text-[12px] font-semibold text-[#173b72]">View All</span>
      </div>

      <div className="mt-5 space-y-3">
        {priorities.slice(0, 2).map((priority, index) => {
          const style = priorityRowStyles[index] ?? priorityRowStyles[1];

          return (
            <div
              key={`${priority.title}-${index}`}
              className="flex items-center justify-between gap-4 rounded-[12px] border px-4 py-3"
              style={{
                backgroundColor: style.bg,
                borderColor: style.border,
              }}
            >
              <div>
                <p className="font-heading text-[15px] font-bold leading-[1.35] text-[#173b72]">
                  {priority.title}
                </p>
                <p
                  className="mt-1 text-[12px] font-semibold"
                  style={{ color: style.due }}
                >
                  {deriveDueLabel(index)}
                </p>
              </div>
              <button
                type="button"
                className="rounded-[8px] border border-[#2b4a7f] px-3 py-1.5 text-[12px] font-semibold text-[#173b72]"
              >
                Action
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
