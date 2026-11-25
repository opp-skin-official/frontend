import { type TodayView, WEEKDAYS } from "@/lib/routine";
import { cn } from "@/lib/utils";

/** 이번 주 루틴 달성률 (Figma "루틴", "루틴-관리 경과"). 아침·저녁 루틴 완료 기준. */
export function WeekCard({ week }: { week: NonNullable<TodayView["week"]> }) {
  const percent = week.percent ?? 0;
  const diff = (week.completed ?? 0) - (week.lastWeekCompleted ?? 0);
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  return (
    <section className="flex flex-col gap-5 rounded-panel border border-border bg-secondary px-[22px] py-5">
      <div className="flex items-center gap-5">
        <svg viewBox="0 0 100 100" className="size-[110px] shrink-0" role="img" aria-label={`달성률 ${percent}%`}>
          <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--border)" strokeWidth="10" />
          {/* 0%일 때 둥근 끝(strokeLinecap)만 점으로 남지 않도록 그리지 않는다. */}
          {percent > 0 && (
            <circle
              cx="50" cy="50" r={radius} fill="none" stroke="var(--brand)" strokeWidth="10"
              strokeDasharray={`${(circumference * percent) / 100} ${circumference}`}
              transform="rotate(-90 50 50)" strokeLinecap="round"
            />
          )}
          <text x="50" y="57" textAnchor="middle" className="fill-foreground text-[22px] font-semibold">
            {percent}%
          </text>
        </svg>
        <div className="flex flex-col gap-2">
          <p className="type-caption text-muted-foreground">예정된 루틴 {week.scheduled}회 중</p>
          <p className="type-section">{week.completed}회 실천했어요</p>
          {diff !== 0 && (
            <span className="w-fit rounded-[8px] bg-brand-strong px-2 py-0.5 type-caption">
              지난주보다 {Math.abs(diff)}회 {diff > 0 ? "더" : "덜"} 실천
            </span>
          )}
        </div>
      </div>
      <ol className="grid grid-cols-7 gap-1.5" aria-label="요일별 실천">
        {(week.days ?? []).map((d, i) => (
          <li key={d.date} className="flex flex-col items-center gap-1.5">
            <span className="type-caption">{WEEKDAYS[i]}</span>
            <span
              title={d.status}
              className={cn(
                "flex size-9 items-center justify-center rounded-[6px] text-sm",
                d.status === "DONE" && "bg-brand-strong",
                d.status === "PARTIAL" && "bg-brand",
                d.status === "NONE" && "bg-surface",
                (d.status === "FUTURE" || d.status === "OUT_OF_PLAN") && "bg-border/50 text-muted-foreground",
              )}
            >
              {d.status === "DONE" ? "✓" : d.status === "PARTIAL" ? "·" : ""}
            </span>
          </li>
        ))}
      </ol>
      <p className="type-caption text-muted-foreground">
        {week.start?.slice(5).replace("-", ".")}~{week.end?.slice(5).replace("-", ".")} · 아침·저녁 루틴 완료 기준
      </p>
    </section>
  );
}
