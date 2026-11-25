"use client";

import Link from "next/link";
import { FocusCard } from "@/components/app/focus-card";
import { RequireLogin } from "@/components/app/require-login";
import { SectionHeader } from "@/components/app/section-header";
import { WeekCard } from "@/components/app/week-card";
import { CHANGE_OPTIONS, CONDITION_OPTIONS, labelOf, useProgressRecords } from "@/lib/progress";
import { type TodayView, WEEKDAYS, useTodayRoutine, useToggleCheck } from "@/lib/routine";
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
          <SectionHeader title="오늘 피부 기록" />
          <div className="px-4 pt-1 pb-8">
            <TodayRecordCard date={data.date!} />
          </div>
          <SectionHeader title="이번 주 루틴 달성률" moreHref="/routine/progress" moreLabel="관리 경과" />
          <div className="px-4 pt-1">
            <WeekCard week={data.week!} />
          </div>
        </>
      )}
    </main>
  );
}

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

function TodayRecordCard({ date }: { date: string }) {
  const { data, isPending } = useProgressRecords(date, date, true);
  if (isPending) return null;
  const record = data?.[0];
  return (
    <Link
      href="/routine/record"
      className="flex items-center justify-between rounded-panel border border-border bg-secondary px-[22px] py-5"
    >
      {record ? (
        <span className="flex flex-col gap-1">
          <span className="type-body-strong">
            {labelOf(CHANGE_OPTIONS, record.perceivedChange)} · 컨디션 {labelOf(CONDITION_OPTIONS, record.skinCondition)}
          </span>
          <span className="type-caption text-muted-foreground">눌러서 고칠 수 있어요</span>
        </span>
      ) : (
        <span className="flex flex-col gap-1">
          <span className="type-body-strong">오늘 피부는 어땠나요?</span>
          <span className="type-caption text-muted-foreground">변화와 컨디션을 남기면 다음 관리에 참고해요</span>
        </span>
      )}
      <span aria-hidden>→</span>
    </Link>
  );
}
