"use client";

import Link from "next/link";
import { RequireLogin } from "@/components/app/require-login";
import { SectionHeader } from "@/components/app/section-header";
import { WeekCard } from "@/components/app/week-card";
import { CONDITION_OPTIONS, type RecordView, labelOf, useProgressRecords } from "@/lib/progress";
import { WEEKDAYS, monthDay, useTodayRoutine } from "@/lib/routine";

/** Figma "루틴-관리 경과"(419:2968): 이번 주 달성률 → 내가 기록한 피부 컨디션. 제품 사용 피드백은 제품 기능 이후. */
export function ProgressView() {
  return (
    <RequireLogin message="관리 경과를 보려면 로그인이 필요해요.">
      {() => <Content />}
    </RequireLogin>
  );
}

function Content() {
  const routine = useTodayRoutine(true);
  const week = routine.data?.week;
  const records = useProgressRecords(week?.start, week?.end, Boolean(week));

  if (routine.isPending) return <p className="px-4 py-8 type-body text-muted-foreground">불러오는 중…</p>;
  if (!routine.data || !week) {
    return (
      <p className="px-4 py-8 type-body text-muted-foreground">
        관리 계획을 만들면 경과를 볼 수 있어요. <Link href="/routine/plan" className="underline">계획 만들기</Link>
      </p>
    );
  }

  return (
    <main className="flex flex-1 flex-col pb-8">
      <header className="px-4 pt-8 pb-6">
        <h2 className="type-title">
          조금씩 쌓인
          <br />
          나의 관리 기록
        </h2>
        <p className="mt-2 type-caption text-muted-foreground">
          {monthDay(week.start)} - {monthDay(week.end)}
        </p>
      </header>
      <SectionHeader title="이번 주 루틴 달성률" />
      <div className="px-4 pt-1 pb-8">
        <WeekCard week={week} />
      </div>
      <SectionHeader title="내가 기록한 피부 컨디션" moreHref="/routine/record" moreLabel="기록하기" />
      <div className="px-4 pt-1 pb-8">
        <ConditionChart start={week.start!} today={routine.data.date!} records={records.data ?? []} />
      </div>
      <p className="px-4 type-caption text-muted-foreground">루틴 완료 기록은 피부 개선을 의미하지 않아요.</p>
    </main>
  );
}

const LEVEL: Record<string, number> = { COMFORT: 0, NORMAL: 1, UNCOMFORTABLE: 2 };

function ConditionChart({ start, today, records }: { start: string; today: string; records: RecordView[] }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(`${start}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + i);
    return d.toISOString().slice(0, 10);
  });
  const byDate = new Map(records.map((r) => [r.date, r]));
  const todayRecord = byDate.get(today);
  const w = 300;
  const h = 120;
  const x = (i: number) => 40 + (i * (w - 56)) / 6;
  const y = (level: number) => 16 + level * 40;
  const points = days
    .map((d, i) => ({ i, r: byDate.get(d) }))
    .filter((p) => p.r)
    .map((p) => ({ x: x(p.i), y: y(LEVEL[p.r!.skinCondition!]) }));

  return (
    <section className="flex flex-col gap-4 rounded-panel border border-border bg-secondary px-[18px] py-5">
      <span className="w-fit rounded-[8px] bg-brand px-3 py-1 type-caption">
        오늘 · {todayRecord ? labelOf(CONDITION_OPTIONS, todayRecord.skinCondition) : "기록 없음"}
      </span>
      <svg viewBox={`0 0 ${w} ${h + 24}`} className="w-full" role="img" aria-label={`이번 주 피부 컨디션 기록 ${records.length}건`}>
        {CONDITION_OPTIONS.map((o, level) => (
          <g key={o.value}>
            <text x="0" y={y(level) + 4} className="fill-muted-foreground text-[11px]">{o.label}</text>
            <line x1="40" x2={w - 16} y1={y(level)} y2={y(level)} stroke="var(--border)" />
          </g>
        ))}
        {points.length > 1 && (
          <polyline
            points={points.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="none"
            stroke="var(--foreground)"
            strokeWidth="1.5"
          />
        )}
        {points.map((p) => (
          <circle key={`${p.x}`} cx={p.x} cy={p.y} r="4" fill="var(--brand)" stroke="var(--foreground)" strokeWidth="1.5" />
        ))}
        {days.map((d, i) => (
          <text key={d} x={x(i)} y={h + 18} textAnchor="middle" className="fill-foreground text-[11px]">
            {WEEKDAYS[i]}
          </text>
        ))}
      </svg>
      <p className="type-caption text-muted-foreground">직접 남긴 컨디션 {records.length}건 · 기록한 날만 표시</p>
    </section>
  );
}
