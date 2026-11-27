"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RequireLogin } from "@/components/app/require-login";
import { Button } from "@/components/ui/button";
import {
  FOCUS_GOALS,
  type FocusGoal,
  GOAL_TYPES,
  type GoalType,
  dDay,
  useCreatePlan,
  useTodayRoutine,
} from "@/lib/routine";
import { cn } from "@/lib/utils";

/** 브라우저 기준 오늘(YYYY-MM-DD). 서버는 한국 시간으로 다시 검증한다. */
function localToday() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function daysBetween(from: string, to: string) {
  return Math.round((Date.parse(to) - Date.parse(from)) / 86400000);
}

/** Figma "루틴-관리 계획 수정"(384:958) */
export function PlanForm() {
  return (
    <RequireLogin message="관리 계획을 만들려면 로그인이 필요해요.">
      {() => <Form />}
    </RequireLogin>
  );
}

function Form() {
  const router = useRouter();
  const current = useTodayRoutine(true);
  const create = useCreatePlan();
  const today = localToday();
  const [goalType, setGoalType] = useState<GoalType>("VACATION");
  const [goalLabel, setGoalLabel] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [focus, setFocus] = useState<FocusGoal>("BASIC_ROUTINE");

  const validDate = targetDate !== "" && targetDate >= today;
  const ready = validDate && (goalType !== "CUSTOM" || goalLabel.trim() !== "");

  return (
    <main className="flex flex-1 flex-col gap-8 px-4 py-6">
      <div className="flex flex-col gap-2">
        <h2 className="type-title">
          어떤 날을
          <br />
          준비하고 있나요?
        </h2>
        <p className="type-caption text-muted-foreground">남은 기간에 맞춰 관리할 일을 나눠드려요</p>
      </div>

      <div role="radiogroup" aria-label="목표 종류" className="flex flex-wrap gap-2">
        {GOAL_TYPES.map((g) => (
          <button
            key={g.value}
            type="button"
            role="radio"
            aria-checked={goalType === g.value}
            onClick={() => setGoalType(g.value)}
            className={cn(
              "pressable h-[42px] rounded-full border px-5 type-body",
              goalType === g.value ? "border-brand-strong bg-brand" : "border-border bg-surface",
            )}
          >
            {g.label}
          </button>
        ))}
      </div>
      {goalType === "CUSTOM" && (
        <input
          value={goalLabel}
          onChange={(e) => setGoalLabel(e.target.value)}
          maxLength={30}
          placeholder="예) 전역, 면회"
          aria-label="목표 이름"
          className="-mt-4 h-[47px] rounded-[14px] border border-border bg-surface px-4 type-body outline-none"
        />
      )}

      <label className="flex flex-col gap-3 rounded-panel border border-border bg-gradient-to-r from-secondary to-brand p-5">
        <span className="type-body-strong">목표 날짜</span>
        <input
          type="date"
          value={targetDate}
          min={today}
          onChange={(e) => setTargetDate(e.target.value)}
          className="bg-transparent type-section outline-none"
        />
        <span className="flex justify-between type-caption">
          <span>오늘부터</span>
          <span className="text-[24px] leading-[30px] font-semibold" data-testid="plan-dday">
            {validDate ? dDay(daysBetween(today, targetDate)) : "-"}
          </span>
        </span>
      </label>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-3 type-body-strong">집중할 관리 목표</legend>
        <div role="radiogroup" aria-label="집중할 관리 목표" className="flex flex-col gap-2">
          {FOCUS_GOALS.map((f) => (
            <button
              key={f.value}
              type="button"
              role="radio"
              aria-checked={focus === f.value}
              onClick={() => setFocus(f.value)}
              className={cn(
                "pressable h-[47px] rounded-[14px] border type-body",
                focus === f.value ? "border-brand-strong bg-brand" : "border-border bg-secondary",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-3">
        <p className="type-caption text-muted-foreground">
          목표일과 관리 목표는 언제든 바꿀 수 있어요.
          {current.data && " 새로 만들면 지금 계획은 보관되고 새 계획으로 시작해요."}
        </p>
        {create.isError && <p role="alert" className="type-body text-destructive">{create.error.message}</p>}
        <Button
          size="cta"
          disabled={!ready || create.isPending}
          onClick={() =>
            create.mutate(
              {
                goalType,
                goalLabel: goalType === "CUSTOM" ? goalLabel : undefined,
                targetDate,
                focusGoal: focus,
              },
              { onSuccess: () => router.push("/routine") },
            )
          }
        >
          {create.isPending ? "만드는 중…" : "관리 계획 만들기"}
        </Button>
      </div>
    </main>
  );
}
