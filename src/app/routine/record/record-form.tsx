"use client";

import Link from "next/link";
import { useState } from "react";
import { RequireLogin } from "@/components/app/require-login";
import { Button } from "@/components/ui/button";
import {
  CHANGE_OPTIONS,
  CONDITION_OPTIONS,
  FOLLOW_UP,
  type PerceivedChange,
  type RecordView,
  type SkinCondition,
  useProgressRecords,
  useSaveRecord,
} from "@/lib/progress";
import { useTodayRoutine } from "@/lib/routine";
import { cn } from "@/lib/utils";

/**
 * 경과 기록 작성 (IA U-05). 오늘 날짜로 하루에 하나, 다시 남기면 고친다.
 * 날짜는 서버의 오늘(한국 시간)을 쓰기 위해 루틴 응답의 date를 쓰고, 계획이 없으면 브라우저 날짜를 쓴다.
 */
export function RecordForm() {
  return (
    <RequireLogin message="경과 기록을 남기려면 로그인이 필요해요.">
      {() => <Loader />}
    </RequireLogin>
  );
}

function browserToday() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function Loader() {
  const routine = useTodayRoutine(true);
  const date = routine.data?.date ?? (routine.isPending ? undefined : browserToday());
  const existing = useProgressRecords(date, date, Boolean(date));
  if (!date || existing.isPending) return <p className="px-4 py-8 type-body text-muted-foreground">불러오는 중…</p>;
  return <Form date={date} initial={existing.data?.[0]} />;
}

function Form({ date, initial }: { date: string; initial?: RecordView }) {
  const save = useSaveRecord();
  const [change, setChange] = useState<PerceivedChange | undefined>(initial?.perceivedChange);
  const [condition, setCondition] = useState<SkinCondition | undefined>(initial?.skinCondition);
  const [memo, setMemo] = useState(initial?.memo ?? "");
  const [, m, d] = date.split("-").map(Number);

  if (save.isSuccess) {
    const follow = FOLLOW_UP[save.data.perceivedChange!];
    return (
      <main className="flex flex-1 flex-col gap-6 px-4 py-8">
        <h2 className="type-title">기록했어요</h2>
        <p className="rounded-panel border border-border bg-secondary px-[22px] py-5 type-body" data-testid="follow-up">
          {follow.message}
        </p>
        <div className="flex flex-col gap-3">
          {follow.link && (
            <Link href={follow.link.href} className="text-center type-body underline">
              {follow.link.label}
            </Link>
          )}
          <Link href="/routine" className="text-center type-body underline">
            루틴으로 돌아가기
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-8 px-4 py-6">
      <div className="flex flex-col gap-2">
        <h2 className="type-title">
          {m}월 {d}일, 피부는
          <br />
          어땠나요?
        </h2>
        <p className="type-caption text-muted-foreground">직접 느낀 변화를 기록해요. 피부 개선을 판정하는 결과는 아니에요.</p>
      </div>
      <Options label="지난 기록과 비교하면" options={CHANGE_OPTIONS} value={change} onChange={setChange} columns={2} />
      <Options label="오늘 피부 컨디션" options={CONDITION_OPTIONS} value={condition} onChange={setCondition} columns={3} />
      <label className="flex flex-col gap-3">
        <span className="type-body-strong">메모 (선택)</span>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="예) 세안 후 당김이 덜했어요"
          className="rounded-[14px] border border-border bg-surface p-4 type-body outline-none"
        />
      </label>
      {save.isError && <p role="alert" className="type-body text-destructive">{save.error.message}</p>}
      <Button
        size="cta"
        disabled={!change || !condition || save.isPending}
        onClick={() => save.mutate({ date, body: { perceivedChange: change!, skinCondition: condition!, memo } })}
      >
        {save.isPending ? "저장 중…" : initial ? "기록 고치기" : "기록하기"}
      </Button>
    </main>
  );
}

function Options<T extends string>({
  label,
  options,
  value,
  onChange,
  columns,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T | undefined;
  onChange: (v: T) => void;
  columns: 2 | 3;
}) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-3 type-body-strong">{label}</legend>
      <div role="radiogroup" aria-label={label} className={cn("grid gap-2", columns === 2 ? "grid-cols-2" : "grid-cols-3")}>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={value === o.value}
            onClick={() => onChange(o.value)}
            className={cn(
              "pressable h-[52px] rounded-[14px] border type-body",
              value === o.value ? "border-brand-strong bg-brand" : "border-border bg-secondary",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
