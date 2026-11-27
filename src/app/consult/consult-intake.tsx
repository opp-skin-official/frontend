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
  type ConsultView,
  type FollowUpRequest,
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
  useFollowUp,
  useLatestConsultation,
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

/** 후속 상담에서 다시 묻는 것: 지금 가능한 관리 시간·제품·목표 기간 */
const FOLLOW_UP_KEYS: (keyof ConsultRequest)[] = ["careTime", "products", "targetDays"];
const FOLLOW_UP_STEPS = STEPS.filter((s) => FOLLOW_UP_KEYS.includes(s.key));

type Flow = "new" | "followup";

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

/** IA 재방문: "지난번과 달라진 점이 있나요?" */
const SINCE_OPTIONS = [
  { value: "same", label: "그대로예요, 지난 방법이 잘 맞아요" },
  { value: "constraints", label: "시간이나 쓸 수 있는 물품이 달라졌어요" },
  { value: "worse", label: "더 불편해졌어요" },
  { value: "new", label: "다른 고민이 생겼어요" },
] as const;
type Since = (typeof SINCE_OPTIONS)[number]["value"];

/** 리포트가 있는 이전 상담이 있으면 달라진 점부터 묻고, 없으면 바로 문진 */
function Intake() {
  const router = useRouter();
  const latest = useLatestConsultation();
  const [since, setSince] = useState<Since | null>(null);
  const [fresh, setFresh] = useState(false);

  if (latest.isPending) return <p className="px-4 py-8 type-body text-muted-foreground">불러오는 중…</p>;
  const previous = latest.data;
  if (!previous || since === "new" || fresh) return <Questionnaire flow="new" />;

  const date = previous.createdAt
    ? new Date(previous.createdAt).toLocaleDateString("ko-KR", { month: "long", day: "numeric" })
    : "";
  const ask = (
    <ChatBubble from="assistant">{`지난번 ${date} '${previous.title}' 상담 이후\n달라진 점이 있나요?`}</ChatBubble>
  );
  const picked = SINCE_OPTIONS.find((o) => o.value === since);

  if (since === "constraints") {
    return (
      <Questionnaire
        flow="followup"
        previous={previous}
        lead={
          <>
            {ask}
            <ChatBubble from="user">{picked!.label}</ChatBubble>
          </>
        }
      />
    );
  }

  return (
    <main data-chat className="flex flex-1 flex-col gap-5 px-4 pt-[25px] pb-8">
      {ask}
      {since === "worse" ? (
        <>
          <ChatBubble from="user">{picked!.label}</ChatBubble>
          <ChatBubble from="assistant">
            {"불편이 심해졌다면 먼저 의무대나 가까운\n의료기관에 상담해 주세요.\n지금 증상을 다시 알려 주시면 새로 살펴볼게요."}
          </ChatBubble>
          <div className="flex justify-end">
            <Button size="cta" className="w-[174px]" onClick={() => setFresh(true)}>
              증상 다시 알려주기
            </Button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-end gap-2" role="group" aria-label="달라진 점 고르기">
          {SINCE_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => (o.value === "same" ? router.push(`/consult/${previous.id}`) : setSince(o.value))}
              className="pressable rounded-bubble rounded-tr-none border border-brand-strong bg-surface px-4 py-2.5 text-left type-body"
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </main>
  );
}

function Questionnaire({ flow, previous, lead }: { flow: Flow; previous?: ConsultView; lead?: React.ReactNode }) {
  const router = useRouter();
  const steps = flow === "followup" ? FOLLOW_UP_STEPS : STEPS;
  // 후속 상담은 이전 답(고민·증상)을 그대로 두고, 다시 묻는 질문에는 지난 답을 표시해 둔다.
  const [answers, setAnswers] = useState<Answers>(flow === "followup" && previous?.answers ? { ...previous.answers } : {});
  const [stepIndex, setStepIndex] = useState(0);
  /** C-02에서 고치려고 돌아온 질문 (답하면 다시 C-02로) */
  const [editing, setEditing] = useState<keyof ConsultRequest | null>(null);
  const [view, setView] = useState<"chat" | "summary">("chat");
  /** 분석이 끝난 상담 (솔루션 보러가기 시트) */
  const [ready, setReady] = useState<ConsultView | null>(null);
  const create = useCreateConsultation();
  const followUp = useFollowUp(previous?.id ?? 0);
  const mutation = flow === "followup" ? followUp : create;
  const bottomRef = useRef<HTMLDivElement>(null);

  const current = editing ? steps.find((s) => s.key === editing)! : steps[stepIndex];
  const answered = steps.filter((s, i) => (editing ? s.key !== editing && s.key in answers : i < stepIndex));

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [stepIndex, editing, view]);

  function submit(all: Answers) {
    // 리포트가 나오면 "솔루션 보러가기" 시트를 먼저 보여 주고, 위험 신호(의료진 안내)는 바로 결과로 간다.
    const done = {
      onSuccess: (data: ConsultView) =>
        data.report ? setReady(data) : router.replace(`/consult/${data.id}`),
    };
    if (flow === "followup") {
      followUp.mutate(
        {
          careTime: all.careTime as FollowUpRequest["careTime"],
          products: (all.products as FollowUpRequest["products"]) ?? [],
          targetDays: (all.targetDays as number | undefined) ?? 0,
        },
        done,
      );
      return;
    }
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
    create.mutate(body, done);
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
    } else if (stepIndex + 1 < steps.length) {
      setStepIndex(stepIndex + 1);
    } else {
      setView("summary");
    }
  }

  function edit(key: keyof ConsultRequest) {
    setEditing(key);
    setView("chat");
  }

  if (ready) return <SolutionReady consult={ready} onOpen={() => router.replace(`/consult/${ready.id}`)} />;

  if (mutation.isPending) return <Analyzing referral={answers.redFlag === true} followUp={flow === "followup"} />;

  if (mutation.isError) {
    return (
      <main className="flex flex-1 flex-col items-start gap-3 px-4 py-8">
        <p role="alert" className="type-body text-destructive">{mutation.error.message}</p>
        <div className="flex gap-2">
          <Button variant="secondary" size="cta" onClick={() => { mutation.reset(); setView("summary"); }}>
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
        editable={flow === "followup" ? FOLLOW_UP_KEYS : undefined}
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
    <main data-chat className="flex flex-1 flex-col gap-5 px-4 pt-[25px] pb-8">
      {lead}
      <ChatBubble from="assistant">
        {flow === "followup"
          ? "고민과 증상은 지난번 그대로 두고,\n지금 가능한 관리 방법만 다시 여쭤볼게요."
          : "지금 불편한 점을 몇 가지 여쭤볼게요.\n답을 고르면 바로 다음 질문으로 넘어가요."}
      </ChatBubble>
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
      "pressable rounded-bubble rounded-tr-none border px-4 py-2.5 text-left type-body",
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
  editable,
  onEdit,
  onRestart,
  onConfirm,
}: {
  answers: Answers;
  /** 고칠 수 있는 항목 (없으면 전부). 후속 상담은 관리 시간·제품·목표만 */
  editable?: (keyof ConsultRequest)[];
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
            {(!editable || editable.includes("kind")) && (
              <button type="button" onClick={() => onEdit("kind")} className="w-fit type-caption text-subtle-foreground underline">
                수정하기
              </button>
            )}
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
                {(!editable || editable.includes(row.key)) && (
                  <button
                    type="button"
                    aria-label={`${row.label} 고치기`}
                    onClick={() => onEdit(row.key)}
                    className="flex size-8 shrink-0 items-center justify-center"
                  >
                    <Icon name="edit" />
                  </button>
                )}
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

/**
 * Figma "솔루션 보러가기": 아래 시트(손잡이) · 얼굴 + 확인 표시 · "지금 할 수 있는 관리법을 준비했어요" · 요약 칩 · 버튼.
 * 칩 문구는 디자인 화면에서 읽을 수 없어 이번 상담 결과(관리 방법 수, 루틴 기간)로 채운다.
 */
function SolutionReady({ consult, onOpen }: { consult: ConsultView; onOpen: () => void }) {
  const report = consult.report;
  const routine = report?.routine;
  const chips = [
    `관리 방법 ${(report?.pairs ?? []).length}가지`,
    routine ? ((routine.targetDays ?? 0) > 0 ? `${routine.targetDays}일 루틴` : "매일 루틴") : null,
    (report?.recommendedIngredients ?? []).length > 0 ? `추천 성분 ${(report?.recommendedIngredients ?? []).length}개` : null,
  ].filter((c): c is string => c !== null).slice(0, 2);
  return (
    <main className="flex flex-1 flex-col justify-end">
      <section
        aria-label="솔루션 준비 완료"
        className="flex flex-col gap-4 rounded-t-[24px] border border-b-0 border-border bg-surface px-6 pt-3 pb-8 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
      >
        <span aria-hidden className="mx-auto h-1 w-10 rounded-full bg-border" />
        <div className="relative mt-3 w-fit">
          <Image src="/images/consult-face.png" alt="" width={64} height={70} />
          <Icon name="check-circle" className="absolute -right-2 bottom-0" />
        </div>
        <h2 className="type-title">
          지금 할 수 있는 관리법을
          <br />
          준비했어요
        </h2>
        <p className="type-caption text-muted-foreground">
          피부 상태와 오늘의 상황에 맞춘
          <br />
          관리법을 정리했어요.
        </p>
        <div className="flex flex-wrap gap-1.5">
          {chips.map((c) => (
            <span key={c} className="rounded-[11px] border border-border bg-secondary px-3 py-0.5 type-caption">
              {c}
            </span>
          ))}
        </div>
        <Button size="cta" className="mt-4 w-full" onClick={onOpen}>
          솔루션 보러가기
        </Button>
      </section>
    </main>
  );
}

function Analyzing({ referral, followUp }: { referral: boolean; followUp?: boolean }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center" aria-live="polite">
      <Image src="/images/consult-character.png" alt="" width={122} height={130} className="animate-pulse" />
      <p className="type-section">
        {referral ? "안내를 준비하고 있어요" : followUp ? "지금 상황에 맞는 루틴을 만들고 있어요" : "피부 상태를 분석하고 있어요"}
      </p>
      {followUp && <p className="type-body text-muted-foreground">지난 분석을 바탕으로 루틴만 다시 만들어요.<br />처음에는 30초 정도 걸릴 수 있어요.</p>}
      {!referral && !followUp && (
        <p className="type-body text-muted-foreground">
          원인과 관리 방법, 루틴을 함께 만들고 있어요.
          <br />
          처음에는 1분 정도 걸릴 수 있어요.
        </p>
      )}
    </main>
  );
}
