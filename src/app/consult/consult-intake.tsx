"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChatBubble } from "@/components/app/chat-bubble";
import { DotList } from "@/components/app/dot-list";
import { Icon } from "@/components/app/icon";
import { RequireLogin } from "@/components/app/require-login";
import { Button } from "@/components/ui/button";
import {
  ACTIVITY_OPTIONS,
  CARE_TIME_OPTIONS,
  CHANGE_OPTIONS,
  type ConsultRequest,
  DURATION_OPTIONS,
  KIND_OPTIONS,
  ONSET_OPTIONS,
  PRODUCT_OPTIONS,
  REGION_OPTIONS,
  SEVERITY_OPTIONS,
  TARGET_OPTIONS,
  labelOf,
  labelsOf,
  useCreateConsultation,
} from "@/lib/consult";
import { cn } from "@/lib/utils";

type Option = { value: string | number | boolean; label: string };

type Step = {
  key: keyof ConsultRequest;
  question: string;
  options: Option[];
  multi?: boolean;
  /** 여러 개 고르는 질문에서 아무것도 안 골라도 되는지 */
  optional?: boolean;
};

const RED_FLAG_OPTIONS: Option[] = [
  { value: false, label: "그런 증상은 없어요" },
  { value: true, label: "있어요" },
];

// Figma "2-2 현재 피부 고민 및 상태 파악"의 질문 순서(고민 → 부위 → 시작·지속 → 위험 신호)에 생활환경·관리 제약을 이어 붙였다.
const STEPS: Step[] = [
  { key: "kind", question: "어떤 점이 가장 불편한가요?", options: KIND_OPTIONS },
  { key: "regions", question: "어디가 불편한가요?\n여러 곳을 골라도 돼요.", options: REGION_OPTIONS, multi: true },
  { key: "onset", question: "처음 생긴 때는 언제인가요?", options: ONSET_OPTIONS },
  { key: "duration", question: "지금까지 얼마나 이어지고 있나요?", options: DURATION_OPTIONS },
  { key: "severity", question: "지금 얼마나 불편한가요?", options: SEVERITY_OPTIONS },
  { key: "change", question: "처음과 비교하면 어떤가요?", options: CHANGE_OPTIONS },
  {
    key: "redFlag",
    question: "붉은 부위가 빠르게 퍼지거나\n열·오한, 심한 진물·고름이 있나요?",
    options: RED_FLAG_OPTIONS,
  },
  {
    key: "activities",
    question: "요즘 피부에 닿는 활동이 있나요?\n여러 개를 골라도 돼요.",
    options: ACTIVITY_OPTIONS,
    multi: true,
    optional: true,
  },
  { key: "careTime", question: "하루에 피부를 관리할 수 있는\n시간은 어느 정도인가요?", options: CARE_TIME_OPTIONS },
  {
    key: "products",
    question: "지금 쓸 수 있는 제품을 골라 주세요.",
    options: PRODUCT_OPTIONS,
    multi: true,
    optional: true,
  },
  { key: "targetDays", question: "언제까지 좋아지고 싶나요?", options: TARGET_OPTIONS },
];

type Answers = Partial<Record<keyof ConsultRequest, unknown>>;

function answerLabel(step: Step, value: unknown) {
  if (step.multi) {
    const labels = step.options.filter((o) => (value as unknown[] | undefined)?.includes(o.value)).map((o) => o.label);
    return labels.length > 0 ? labels.join(", ") : "해당 없어요";
  }
  return step.options.find((o) => o.value === value)?.label ?? "";
}

/** C-01 문진(선택지) → C-02 상담 내용 확인 → 분석 → R-01 리포트 */
export function ConsultIntake() {
  return (
    <RequireLogin message="AI 피부 상담을 하려면 로그인이 필요해요.">
      {() => <Intake />}
    </RequireLogin>
  );
}

function Intake() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Answers>({});
  const [stepIndex, setStepIndex] = useState(0);
  /** C-02에서 고치려고 돌아온 질문 (답하면 다시 C-02로) */
  const [editing, setEditing] = useState<keyof ConsultRequest | null>(null);
  const [view, setView] = useState<"chat" | "summary">("chat");
  const create = useCreateConsultation();
  const bottomRef = useRef<HTMLDivElement>(null);

  const current = editing ? STEPS.find((s) => s.key === editing)! : STEPS[stepIndex];
  const answered = STEPS.filter((s, i) => (editing ? s.key !== editing && s.key in answers : i < stepIndex));

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [stepIndex, editing, view]);

  function submit(all: Answers) {
    const body = {
      kind: all.kind,
      regions: all.regions,
      onset: all.onset,
      duration: all.duration,
      severity: all.severity,
      change: all.change,
      redFlag: all.redFlag === true,
      activities: (all.activities as unknown[] | undefined) ?? [],
      careTime: all.careTime,
      products: (all.products as unknown[] | undefined) ?? [],
      targetDays: (all.targetDays as number | undefined) ?? 0,
    } as ConsultRequest;
    create.mutate(body, { onSuccess: (data) => router.replace(`/consult/${data.id}`) });
  }

  function answer(value: unknown) {
    const next = { ...answers, [current.key]: value };
    setAnswers(next);
    // 위험 신호가 있으면 더 묻지 않고 바로 의료진 안내로 끝낸다.
    if (current.key === "redFlag" && value === true) {
      submit(next);
      return;
    }
    if (editing) {
      setEditing(null);
      setView("summary");
    } else if (stepIndex + 1 < STEPS.length) {
      setStepIndex(stepIndex + 1);
    } else {
      setView("summary");
    }
  }

  function edit(key: keyof ConsultRequest) {
    setEditing(key);
    setView("chat");
  }

  if (create.isPending) return <Analyzing referral={answers.redFlag === true} />;

  if (create.isError) {
    return (
      <main className="flex flex-1 flex-col items-start gap-3 px-4 py-8">
        <p role="alert" className="type-body text-destructive">{create.error.message}</p>
        <div className="flex gap-2">
          <Button variant="secondary" size="cta" onClick={() => { create.reset(); setView("summary"); }}>
            내용 다시 보기
          </Button>
          <Button size="cta" onClick={() => submit(answers)}>다시 분석하기</Button>
        </div>
      </main>
    );
  }

  if (view === "summary") {
    return (
      <Summary
        answers={answers}
        onEdit={edit}
        // 처음 질문부터 다시 묻되, 고른 답은 표시해 둔다.
        onRestart={() => {
          setEditing(null);
          setStepIndex(0);
          setView("chat");
        }}
        onConfirm={() => submit(answers)}
      />
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-5 px-4 pt-[25px] pb-8">
      <ChatBubble from="assistant">{"지금 불편한 점을 몇 가지 여쭤볼게요.\n답을 고르면 바로 다음 질문으로 넘어가요."}</ChatBubble>
      {answered.map((step) => (
        <div key={step.key} className="flex flex-col gap-3">
          <ChatBubble from="assistant">{step.question}</ChatBubble>
          <ChatBubble from="user">{answerLabel(step, answers[step.key])}</ChatBubble>
        </div>
      ))}
      <div className="flex flex-col gap-3">
        <ChatBubble from="assistant">{current.question}</ChatBubble>
        <Choices key={current.key} step={current} initial={answers[current.key]} onAnswer={answer} />
      </div>
      <div ref={bottomRef} />
    </main>
  );
}

function Choices({ step, initial, onAnswer }: { step: Step; initial: unknown; onAnswer: (value: unknown) => void }) {
  const [picked, setPicked] = useState<unknown[]>(step.multi ? ((initial as unknown[] | undefined) ?? []) : []);
  const chip = (active: boolean) =>
    cn(
      "rounded-bubble rounded-tr-none border px-4 py-2.5 text-left type-body",
      active ? "border-brand-strong bg-brand" : "border-brand-strong bg-surface",
    );

  if (!step.multi) {
    return (
      <div className="flex flex-col items-end gap-2" role="group" aria-label="답 고르기">
        {step.options.map((o) => (
          <button key={String(o.value)} type="button" onClick={() => onAnswer(o.value)} className={chip(initial === o.value)}>
            {o.label}
          </button>
        ))}
      </div>
    );
  }
  return (
    <div className="flex flex-col items-end gap-2" role="group" aria-label="답 고르기 (여러 개)">
      <div className="flex flex-wrap justify-end gap-2">
        {step.options.map((o) => {
          const active = picked.includes(o.value);
          return (
            <button
              key={String(o.value)}
              type="button"
              aria-pressed={active}
              onClick={() => setPicked((p) => (active ? p.filter((v) => v !== o.value) : [...p, o.value]))}
              className={chip(active)}
            >
              {o.label}
            </button>
          );
        })}
      </div>
      <Button
        size="cta"
        className="mt-1 w-[174px]"
        disabled={!step.optional && picked.length === 0}
        onClick={() => onAnswer(picked)}
      >
        {picked.length === 0 && step.optional ? "해당 없어요" : "다음"}
      </Button>
    </div>
  );
}

/** Figma "2-2-3 상담 내용 확인 및 수정"(420:1933) */
function Summary({
  answers,
  onEdit,
  onRestart,
  onConfirm,
}: {
  answers: Answers;
  onEdit: (key: keyof ConsultRequest) => void;
  onRestart: () => void;
  onConfirm: () => void;
}) {
  const a = answers as Partial<ConsultRequest>;
  const activities = labelsOf(ACTIVITY_OPTIONS, a.activities);
  const products = labelsOf(PRODUCT_OPTIONS, a.products);
  const rows: { label: string; value: string[]; key: keyof ConsultRequest }[] = [
    { label: "발생 • 지속", value: [labelOf(ONSET_OPTIONS, a.onset), labelOf(DURATION_OPTIONS, a.duration)], key: "onset" },
    { label: "요즘 활동", value: activities.length > 0 ? activities : ["해당 없음"], key: "activities" },
    { label: "관리 가능 시간", value: [labelOf(CARE_TIME_OPTIONS, a.careTime)], key: "careTime" },
    { label: "사용 가능한 제품", value: products.length > 0 ? products : ["없음"], key: "products" },
    { label: "목표", value: [labelOf(TARGET_OPTIONS, a.targetDays)], key: "targetDays" },
  ];

  return (
    <main className="flex flex-1 flex-col px-4 pt-10 pb-8">
      <h2 className="type-title">이렇게 정리했어요</h2>
      <p className="mt-2 type-body text-muted-foreground">다른 내용이 있다면 수정해주세요.</p>
      <div className="relative mt-[50px]">
        <Image
          src="/images/consult-character.png"
          alt=""
          width={122}
          height={130}
          className="absolute -top-[86px] right-0"
        />
        <section className="relative flex flex-col gap-6 rounded-panel border border-border bg-secondary px-7 py-7">
          <div className="flex flex-col gap-1.5">
            <p className="type-body-strong">
              <DotList items={[labelsOf(REGION_OPTIONS, a.regions).join("·"), labelOf(KIND_OPTIONS, a.kind)]} />
            </p>
            <p className="type-label text-muted-foreground">
              <DotList items={[labelOf(SEVERITY_OPTIONS, a.severity), labelOf(CHANGE_OPTIONS, a.change)]} />
            </p>
            <button type="button" onClick={() => onEdit("kind")} className="w-fit type-caption text-subtle-foreground underline">
              수정하기
            </button>
          </div>
          <dl className="flex flex-col gap-5">
            {rows.map((row) => (
              <div key={row.label} className="flex items-end justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <dt className="type-label text-muted-foreground">{row.label}</dt>
                  <dd className="type-body-strong">
                    <DotList items={row.value.filter(Boolean)} />
                  </dd>
                </div>
                <button
                  type="button"
                  aria-label={`${row.label} 고치기`}
                  onClick={() => onEdit(row.key)}
                  className="flex size-8 shrink-0 items-center justify-center"
                >
                  <Icon name="edit" />
                </button>
              </div>
            ))}
          </dl>
        </section>
      </div>
      <div className="mt-auto grid grid-cols-2 gap-[21px] pt-8">
        <Button variant="secondary" size="cta" onClick={onRestart}>
          대화 내용 수정
        </Button>
        <Button size="cta" onClick={onConfirm}>
          확인했어요
        </Button>
      </div>
    </main>
  );
}

function Analyzing({ referral }: { referral: boolean }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center" aria-live="polite">
      <Image src="/images/consult-character.png" alt="" width={122} height={130} className="animate-pulse" />
      <p className="type-section">{referral ? "안내를 준비하고 있어요" : "피부 상태를 분석하고 있어요"}</p>
      {!referral && (
        <p className="type-body text-muted-foreground">
          원인과 관리 방법, 루틴을 함께 만들고 있어요.
          <br />
          처음에는 1분 정도 걸릴 수 있어요.
        </p>
      )}
    </main>
  );
}
