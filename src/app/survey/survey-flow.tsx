"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useMe } from "@/lib/auth";
import { AXES, type QuestionView, useSubmitAssessment, useSurvey } from "@/lib/survey";
import { cn } from "@/lib/utils";

type Step = { kind: "consent" } | { kind: "axis"; index: number };

export function SurveyFlow() {
  const router = useRouter();
  const me = useMe();
  const survey = useSurvey(Boolean(me.data));
  const submit = useSubmitAssessment();
  const [step, setStep] = useState<Step>({ kind: "consent" });
  const [consent, setConsent] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const pages = useMemo(() => {
    const questions = survey.data?.questions ?? [];
    return AXES.map((a) => ({
      ...a,
      questions: questions.filter((q) => q.axis === a.axis && (consent || !q.sensitive)),
    }));
  }, [survey.data, consent]);

  if (me.data === null) {
    return (
      <Notice>
        진단 결과를 저장하려면 로그인이 필요해요.{" "}
        <Link href="/login" className="underline">로그인하러 가기</Link>
      </Notice>
    );
  }
  if (survey.isPending || me.isPending) return <Notice>문항을 불러오는 중…</Notice>;
  if (survey.isError || !survey.data) return <Notice>문항을 불러오지 못했어요.</Notice>;

  if (step.kind === "consent") {
    return (
      <main className="flex flex-1 flex-col justify-between gap-6 px-4 py-8">
        <div className="flex flex-col gap-4">
          <h2 className="type-title">내 피부 유형을 알아봐요</h2>
          <p className="type-body text-muted-foreground">
            5가지 영역, 25문항 이내예요. 3분 정도 걸려요.
          </p>
          <label className="flex items-start gap-3 rounded-panel border border-border bg-secondary p-4">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 size-5 accent-[var(--brand-strong)]"
            />
            <span className="flex flex-col gap-1">
              <span className="type-body-strong">(선택) 가족력·흡연 문항에 답할게요</span>
              {/* TODO: 민감정보 수집·이용 동의 문구 확정 후 교체 (Notion 설문 문서 남은 과제 5) */}
              <span className="type-caption text-muted-foreground">
                가족의 피부 특징과 흡연 여부는 민감한 정보예요. 동의하면 진단에만 쓰고, 동의하지 않아도 진단할 수 있어요.
              </span>
            </span>
          </label>
        </div>
        <Button size="cta" onClick={() => setStep({ kind: "axis", index: 0 })}>
          시작하기
        </Button>
      </main>
    );
  }

  const page = pages[step.index];
  const isLast = step.index === pages.length - 1;
  const pageDone = page.questions.every((q) => answers[q.number!] !== undefined);

  const onNext = () => {
    if (!isLast) {
      setStep({ kind: "axis", index: step.index + 1 });
      window.scrollTo({ top: 0 });
      return;
    }
    const allowed = new Set(pages.flatMap((p) => p.questions.map((q) => q.number!)));
    const body = Object.fromEntries(Object.entries(answers).filter(([n]) => allowed.has(Number(n))));
    submit.mutate(
      { version: survey.data.version!, sensitiveConsent: consent, answers: body },
      { onSuccess: () => router.push("/survey/result") },
    );
  };

  return (
    <main className="flex flex-1 flex-col gap-6 px-4 py-6">
      <div className="flex items-center justify-between">
        <h2 className="type-section">{page.title}</h2>
        <span className="type-caption text-muted-foreground" aria-label="진행 단계">
          {step.index + 1} / {pages.length}
        </span>
      </div>
      <ol className="flex flex-col gap-6">
        {page.questions.map((q) => (
          <QuestionCard
            key={q.number}
            question={q}
            selected={answers[q.number!]}
            onSelect={(position) => setAnswers((a) => ({ ...a, [q.number!]: position }))}
          />
        ))}
      </ol>
      {submit.isError && (
        <p role="alert" className="type-body text-destructive">
          {submit.error.message}
        </p>
      )}
      <div className="grid grid-cols-2 gap-[21px]">
        <Button
          variant="secondary"
          size="cta"
          onClick={() =>
            setStep(step.index === 0 ? { kind: "consent" } : { kind: "axis", index: step.index - 1 })
          }
        >
          이전
        </Button>
        <Button size="cta" disabled={!pageDone || submit.isPending} onClick={onNext}>
          {isLast ? (submit.isPending ? "진단 중…" : "결과 보기") : "다음"}
        </Button>
      </div>
    </main>
  );
}

function QuestionCard({
  question,
  selected,
  onSelect,
}: {
  question: QuestionView;
  selected: number | undefined;
  onSelect: (position: number) => void;
}) {
  return (
    <li className="flex flex-col gap-3">
      <p className="type-body-strong">
        {question.number}. {question.text}
      </p>
      {/* 이미지 문항은 예시 이미지가 준비될 때까지 글자 선택지로 보여 준다. */}
      <div role="radiogroup" aria-label={question.text} className="grid grid-cols-2 gap-2">
        {question.options?.map((o) => (
          <button
            key={o.position}
            type="button"
            role="radio"
            aria-checked={selected === o.position}
            onClick={() => onSelect(o.position!)}
            className={cn(
              "pressable min-h-[47px] rounded-[14px] border px-3 py-2 text-left type-body",
              selected === o.position
                ? "border-brand-strong bg-brand"
                : "border-border bg-surface",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </li>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return <p className="px-4 py-8 type-body text-muted-foreground">{children}</p>;
}
