"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RequireLogin } from "@/components/app/require-login";
import { Button } from "@/components/ui/button";
import {
  ALLERGY_OPTIONS,
  type AllergyExperience,
  OUTDOOR_TRAINING_OPTIONS,
  type OutdoorTraining,
  WASH_TIME_OPTIONS,
  type WashTime,
  useCareInfo,
  useSaveEnvironment,
} from "@/lib/care-info";
import { cn } from "@/lib/utils";

/** Figma "3-4 기타정보-생활환경"(395:1155) + 알레르기 경험 질문 */
export function EnvironmentForm() {
  return (
    <RequireLogin message="생활 환경을 입력하려면 로그인이 필요해요.">
      {() => <FormContent />}
    </RequireLogin>
  );
}

function FormContent() {
  const { data, isPending } = useCareInfo(true);
  if (isPending) return <p className="px-4 py-8 type-body text-muted-foreground">불러오는 중…</p>;
  // 저장된 값이 있으면 그 값으로 시작한다.
  return <Form initial={data?.environment ?? undefined} />;
}

function Form({
  initial,
}: {
  initial?: { washTime?: WashTime; outdoorTraining?: OutdoorTraining; allergyExperience?: AllergyExperience };
}) {
  const router = useRouter();
  const save = useSaveEnvironment();
  const [washTime, setWashTime] = useState(initial?.washTime);
  const [training, setTraining] = useState(initial?.outdoorTraining);
  const [allergy, setAllergy] = useState(initial?.allergyExperience);
  const ready = washTime && training && allergy;

  return (
    <main className="flex flex-1 flex-col justify-between gap-8 px-4 py-6">
      <div className="flex flex-col gap-8">
        <Choice
          question="하루 중 세안이 가능한 시간은 언제인가요?"
          options={WASH_TIME_OPTIONS}
          value={washTime}
          onChange={setWashTime}
          columns={2}
        />
        <Choice
          question="야외훈련은 얼마나 자주 하나요?"
          options={OUTDOOR_TRAINING_OPTIONS}
          value={training}
          onChange={setTraining}
          columns={1}
        />
        <Choice
          question="특정 제품과 성분에 알레르기, 자극을 경험한 적이 있나요?"
          options={ALLERGY_OPTIONS}
          value={allergy}
          onChange={setAllergy}
          columns={3}
        />
      </div>
      {save.isError && <p role="alert" className="type-body text-destructive">{save.error.message}</p>}
      <Button
        size="cta"
        className="h-[52px] rounded-[26px]"
        disabled={!ready || save.isPending}
        onClick={() =>
          save.mutate(
            { washTime: washTime!, outdoorTraining: training!, allergyExperience: allergy! },
            { onSuccess: () => router.push("/profile/care-info") },
          )
        }
      >
        {save.isPending ? "저장 중…" : "저장"}
      </Button>
    </main>
  );
}

function Choice<T extends string>({
  question,
  options,
  value,
  onChange,
  columns,
}: {
  question: string;
  options: { value: T; label: string }[];
  value: T | undefined;
  onChange: (value: T) => void;
  columns: 1 | 2 | 3;
}) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-3 type-body-strong">{question}</legend>
      <div
        role="radiogroup"
        aria-label={question}
        className={cn("grid gap-2", columns === 1 && "grid-cols-1", columns === 2 && "grid-cols-2", columns === 3 && "grid-cols-3")}
      >
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={value === o.value}
            onClick={() => onChange(o.value)}
            className={cn(
              "h-[62px] rounded-[16px] border type-body",
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
