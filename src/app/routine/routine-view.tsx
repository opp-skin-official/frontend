"use client";

import { FocusCard } from "@/components/app/focus-card";
import { RequireLogin } from "@/components/app/require-login";
import { SectionHeader } from "@/components/app/section-header";
import { type TodayView, useTodayRoutine, useToggleCheck } from "@/lib/routine";
import { cn } from "@/lib/utils";

/** Figma "루틴"(373:593): 나의 집중 관리 → 오늘의 루틴 → 이번 주 루틴 달성률 → 요일별 기록 */
export function RoutineView() {
  return (
    <RequireLogin message="루틴을 보려면 로그인이 필요해요.">
      {() => <RoutineContent />}
    </RequireLogin>
  );
}

function RoutineContent() {
  const { data, isPending, isError } = useTodayRoutine(true);
  if (isPending) return <p className="px-4 py-8 type-body text-muted-foreground">불러오는 중…</p>;
  if (isError) return <p className="px-4 py-8 type-body text-destructive">루틴을 불러오지 못했어요.</p>;

  return (
    <main className="flex flex-1 flex-col pb-8">
      <SectionHeader title="나의 집중 관리" moreHref={data ? "/routine/plan" : undefined} moreLabel="계획 바꾸기" />
      <div className="px-4 pt-1 pb-8">
        <FocusCard plan={data?.plan} href="/routine/plan" />
      </div>
      {data && (
        <>
          <SectionHeader title="오늘의 루틴" />
          <div className="px-4 pt-1 pb-8">
            <TodayCard today={data} />
          </div>
          <SectionHeader title="이번 주 루틴 달성률" />
          <div className="px-4 pt-1">
            <WeekCard week={data.week!} />
          </div>
        </>
      )}
    </main>
  );
}

const WEEKDAYS = ["월", "화", "수", "목", "금", "토", "일"];

function TodayCard({ today }: { today: TodayView }) {
  const toggle = useToggleCheck();
  const items = today.items ?? [];
  const [, m, d] = (today.date ?? "").split("-").map(Number);
  const weekday = WEEKDAYS[(new Date(`${today.date}T00:00:00`).getDay() + 6) % 7];
  const groups = [
    { time: "MORNING", label: "아침" },
    { time: "EVENING", label: "저녁" },
  ] as const;

  return (
    <section className="flex flex-col gap-4 rounded-panel border border-border bg-secondary px-[22px] py-5">
      <p className="type-caption text-muted-foreground">
        {m}월 {d}일 {weekday}요일 | {items.length}개 중 {today.doneCount}개 완료
      </p>
      {groups.map((g) => (
        <div key={g.time} className="flex flex-col gap-3">
          <p className="type-body-strong">{g.label}</p>
          {items
            .filter((i) => i.timeOfDay === g.time)
            .map((item) => (
              <button
                key={item.id}
                type="button"
                role="checkbox"
                aria-checked={item.checked}
                aria-label={`${g.label} ${item.title}`}
                disabled={toggle.isPending}
                onClick={() => toggle.mutate({ itemId: item.id!, date: today.date!, checked: !item.checked })}
                className="flex items-center gap-3 text-left"
              >
                <span
                  aria-hidden
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full border",
                    item.checked ? "border-brand-strong bg-brand" : "border-border bg-surface",
                  )}
                >
                  {item.checked ? "✓" : ""}
                </span>
                <span className="flex flex-col">
                  <span className="type-body-strong">{item.title}</span>
                  <span className="type-caption text-muted-foreground">{item.subtitle}</span>
                </span>
              </button>
            ))}
        </div>
      ))}
      {toggle.isError && <p role="alert" className="type-caption text-destructive">{toggle.error.message}</p>}
    </section>
  );
}

function WeekCard({ week }: { week: NonNullable<TodayView["week"]> }) {
  const percent = week.percent ?? 0;
  const diff = (week.completed ?? 0) - (week.lastWeekCompleted ?? 0);
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  return (
    <section className="flex flex-col gap-5 rounded-panel border border-border bg-secondary px-[22px] py-5">
      <div className="flex items-center gap-5">
        <svg viewBox="0 0 100 100" className="size-[110px] shrink-0" role="img" aria-label={`달성률 ${percent}%`}>
          <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--border)" strokeWidth="10" />
          <circle
            cx="50" cy="50" r={radius} fill="none" stroke="var(--brand)" strokeWidth="10"
            strokeDasharray={`${(circumference * percent) / 100} ${circumference}`}
            transform="rotate(-90 50 50)" strokeLinecap="round"
          />
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
