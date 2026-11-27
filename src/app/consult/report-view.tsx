"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Chip } from "@/components/app/chip";
import { ReportAiContent } from "@/components/app/report-ai-content";
import { RequireLogin } from "@/components/app/require-login";
import { Button } from "@/components/ui/button";
import { DotList } from "@/components/app/dot-list";
import {
  ACTIVITY_OPTIONS,
  CHANGE_OPTIONS,
  type ConsultView,
  DURATION_OPTIONS,
  KIND_OPTIONS,
  ONSET_OPTIONS,
  REGION_OPTIONS,
  SEVERITY_OPTIONS,
  type ReportView,
  type RoutineView,
  labelOf,
  labelsOf,
  useApplyRoutine,
  useConsultation,
  useRegenerateRoutine,
} from "@/lib/consult";
import { reportConsultation } from "@/lib/ai-report";
import { useRecommendations, won } from "@/lib/products";

const DEFAULT_NOTICE = "이 안내는 피부 상태 관찰과 일상 관리 참고용이며, 의학적 판단이나 개선 보장이 아니에요.";

/**
 * R-01 관리 리포트 — Figma "솔루션"(420:2093, MY SKIN CARE PLAN):
 * TODAY'S SKIN → DO·DON'T → 추천(제품 데이터 전까지 성분) → 루틴(Model B)·관리 시작(U-02, 디자인 밖 추가).
 */
export function ConsultReport() {
  return (
    <RequireLogin message="상담 결과를 보려면 로그인이 필요해요.">
      {() => <ReportContent />}
    </RequireLogin>
  );
}

function ReportContent() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const consult = useConsultation(id);

  if (consult.isPending) return <p className="px-4 py-8 type-body text-muted-foreground">불러오는 중…</p>;
  if (consult.isError) return <p className="px-4 py-8 type-body text-destructive">{consult.error.message}</p>;

  const data = consult.data;
  return (
    <main className="flex flex-1 flex-col gap-4 px-4 pt-6 pb-10">
      {data.followsId != null && (
        <p className="type-caption text-muted-foreground">
          지난 상담을 이어서 지금 상황에 맞게 루틴을 다시 만들었어요.{" "}
          <Link href={`/consult/${data.followsId}`} className="underline">지난 리포트 보기</Link>
        </p>
      )}
      <TodaysSkin consult={data} />
      {data.state === "REFERRED" || !data.report ? <Referral /> : <Report consult={data} report={data.report} />}
    </main>
  );
}

/** Figma "TODAY'S SKIN": 얼굴 · 고민 제목 · 증상·시작·활동 · 진단 아님 안내 */
function TodaysSkin({ consult }: { consult: ConsultView }) {
  const a = consult.answers;
  const date = consult.createdAt
    ? new Date(consult.createdAt).toLocaleDateString("ko-KR", { month: "long", day: "numeric" })
    : "";
  const activities = labelsOf(ACTIVITY_OPTIONS, a?.activities);
  const pair = consult.report?.pairs?.[0];
  return (
    <section aria-label="오늘의 피부" className="flex flex-col gap-3 rounded-panel border border-border bg-secondary px-5 pt-5 pb-4">
      <div className="flex items-baseline justify-between">
        <h2 className="type-body-strong">TODAY&apos;S SKIN</h2>
        <span className="type-caption text-muted-foreground">{date}</span>
      </div>
      <div className="flex gap-4">
        <div className="flex size-[90px] shrink-0 items-end justify-center overflow-hidden rounded-[10px] border border-border bg-surface">
          <Image src="/images/consult-face.png" alt="" width={72} height={79} />
        </div>
        <div className="flex min-w-0 flex-col gap-1">
          <p className="type-body-strong">
            {labelsOf(REGION_OPTIONS, a?.regions).join("·")} {labelOf(KIND_OPTIONS, a?.kind)}
          </p>
          <p className="type-body text-muted-foreground">
            <DotList items={[labelOf(SEVERITY_OPTIONS, a?.severity), labelOf(CHANGE_OPTIONS, a?.change)].filter(Boolean)} />
          </p>
          <p className="type-body text-muted-foreground">
            {labelOf(ONSET_OPTIONS, a?.onset)} · {labelOf(DURATION_OPTIONS, a?.duration)}
          </p>
          {activities.length > 0 && <p className="type-body text-muted-foreground">최근 {activities.join(" 및 ")}</p>}
        </div>
      </div>
      {pair?.observation && <p className="type-body">{pair.observation}</p>}
      <p className="text-center type-caption text-subtle-foreground">
        상담 내용을 요약한 참고 정보이며, 질환을 확정하는 진단 결과는 아닙니다.
      </p>
    </section>
  );
}

function Referral() {
  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-panel bg-brand px-5 py-5">
        <p className="type-body-strong">가까운 의무대나 의료기관에 바로 상담해 주세요.</p>
        <p className="mt-2 type-body">
          붉은 부위가 빠르게 퍼지거나 열·오한, 심한 진물·고름이 있으면 집에서 관리하기보다 바로 확인을 받는 것이 안전해요.
        </p>
      </section>
      <p className="type-caption text-subtle-foreground">{DEFAULT_NOTICE}</p>
      <Link href="/" className="type-body underline">홈으로</Link>
    </div>
  );
}

function Report({ consult, report }: { consult: ConsultView; report: ReportView }) {
  const pairs = report.pairs ?? [];
  const recommended = report.recommendedIngredients ?? [];
  const caution = report.cautionIngredients ?? [];
  const dos = pairs.map((p) => p.solution).filter((t): t is string => !!t);
  // 모델 A는 "피할 행동"을 따로 주지 않아, 주의가 필요한 성분을 피할 행동으로 보여 준다(R09: 단정하지 않는 표현).
  const donts = caution.map((g) => `${g.labelKo ?? g.key} 주의하기`);
  const causes = pairs.map((p) => p.cause).filter((t): t is string => !!t);
  return (
    <>
      <section aria-label="관리 방법" className="flex flex-col gap-5 rounded-panel border border-border bg-secondary px-5 py-5">
        <ActionList kind="do" items={dos.length > 0 ? dos : ["근거가 충분한 안내를 찾지 못했어요. 증상이 계속되면 의무대나 의료기관에 상담해 주세요."]} />
        {donts.length > 0 && <ActionList kind="dont" items={donts} />}
        {causes.length > 0 && (
          <p className="type-caption text-muted-foreground">원인 참고: {causes.join(" ")}</p>
        )}
      </section>
      {report.referToClinician && (
        <p className="rounded-panel bg-brand px-5 py-4 type-body">
          {report.referralNotice ?? "일부 항목은 전문가 확인이 권장돼요. 가까운 의무대나 의료기관에 상담해 주세요."}
        </p>
      )}

      <RecommendedProducts consultationId={consult.id!} ingredients={recommended.map((g) => g.labelKo ?? g.key ?? "")} />

      <section aria-label="추천 루틴" className="flex flex-col gap-3 pt-2">
        <h2 className="type-body-strong">추천 루틴</h2>
        {report.routine ? <Routine routine={report.routine} /> : <RoutineMissing id={consult.id!} />}
      </section>

      {report.routine && <ApplyRoutine id={consult.id!} applied={report.appliedPlanId != null} />}
      <p className="pt-2 type-caption text-subtle-foreground">{report.notice ?? DEFAULT_NOTICE}</p>
      <ReportAiContent
        label="이 리포트 신고"
        title="이 리포트를 신고할까요?"
        onSubmit={(body) => reportConsultation(consult.id!, body)}
      />
    </>
  );
}

/**
 * Figma "추천제품": 이미지 · 특징 칩 · 이름 · 가격 · >. 이 상담 리포트의 성분으로 궁합 점수순 상위 3개.
 * 제품 데이터가 없으면 추천 성분만 보여 준다.
 */
function RecommendedProducts({ consultationId, ingredients }: { consultationId: number; ingredients: string[] }) {
  const { data, isPending } = useRecommendations({ consultationId, limit: 3 }, true);
  const items = data?.items ?? [];
  if (isPending) return null;
  if (items.length === 0) {
    if (ingredients.length === 0) return null;
    return (
      <section aria-label="추천 성분" className="flex flex-col gap-3 pt-2">
        <h2 className="type-body-strong">추천 성분</h2>
        <div className="flex flex-wrap gap-1.5">
          {ingredients.map((g) => <Chip key={g} variant="outline">{g}</Chip>)}
        </div>
        <p className="type-caption text-muted-foreground">
          아직 조건에 맞는 PX 제품을 찾지 못했어요. 리포트에서 피하라고 한 성분이 든 제품은 추천하지 않아요.
        </p>
      </section>
    );
  }
  return (
    <section aria-label="추천제품" className="flex flex-col gap-3 pt-2">
      <h2 className="type-body-strong">추천제품</h2>
      <ul className="flex flex-col gap-3">
        {items.map((r) => {
          const p = r.product!;
          const reason = r.reasons?.[0]?.split(":")[0].replace("리포트 추천 성분 ", "");
          return (
            <li key={p.id}>
              <Link
                href={`/products/${p.id}`}
                className="flex items-center gap-4 rounded-panel border border-border bg-secondary px-4 py-4"
              >
                <span className="flex size-[90px] shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-surface">
                  {p.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.imageUrl} alt="" className="max-h-[80px] max-w-[80px] object-contain" />
                  ) : (
                    <span className="type-caption text-subtle-foreground">이미지 준비 중</span>
                  )}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <span className="flex flex-wrap gap-1">
                    {r.score != null && <Chip variant="brand">궁합 {r.score}점</Chip>}
                    {reason && <Chip variant="outline">{reason}</Chip>}
                  </span>
                  <span className="truncate type-body-strong">{p.name}</span>
                  <span className="type-body-strong">{won(p.price ?? 0)}</span>
                  {(r.cautions ?? []).length > 0 && (
                    <span className="truncate type-caption text-caution">{r.cautions![0]}</span>
                  )}
                </span>
                <span aria-hidden className="text-lg">›</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** Figma "● DO · 지금 해야 할 행동" / "● DON'T · 피해야 할 행동": 점 + 제목, 흰 카드 안 목록 */
function ActionList({ kind, items }: { kind: "do" | "dont"; items: string[] }) {
  const isDo = kind === "do";
  return (
    <div className="flex flex-col gap-3">
      <h3 className="flex items-center gap-1.5 type-body-strong">
        <span aria-hidden className={isDo ? "size-3 rounded-full bg-brand-strong" : "size-3 rounded-full bg-caution"} />
        <span className={isDo ? "text-brand-strong" : "text-caution"}>{isDo ? "DO" : "DON'T"}</span>
        <span>· {isDo ? "지금 해야 할 행동" : "피해야 할 행동"}</span>
      </h3>
      <ul className="flex flex-col gap-2 rounded-[16px] border border-border bg-surface px-5 py-4 type-body">
        {items.map((t) => <li key={t}>{t}</li>)}
      </ul>
    </div>
  );
}

function Routine({ routine }: { routine: RoutineView }) {
  return (
    <div className="flex flex-col gap-3">
      {routine.summary && <p className="type-body text-muted-foreground">{routine.summary}</p>}
      {(routine.phases ?? []).map((phase, i) => (
        <section key={i} className="flex flex-col gap-3 rounded-panel border border-border bg-secondary px-5 py-5">
          <div className="flex items-baseline justify-between gap-2">
            <p className="type-body-strong">{phase.label}</p>
            <span className="shrink-0 type-caption text-muted-foreground">{phase.dayRange}</span>
          </div>
          {phase.focus && <p className="type-body text-muted-foreground">{phase.focus}</p>}
          <Steps label="아침" items={phase.morning} />
          <Steps label="저녁" items={phase.evening} />
          <Steps label="활동 후" items={phase.postActivity} />
          {phase.checkpoint && <p className="type-caption">점검: {phase.checkpoint}</p>}
        </section>
      ))}
      {routine.referToClinician && routine.referralNotice && (
        <p className="rounded-panel bg-brand px-5 py-4 type-body">{routine.referralNotice}</p>
      )}
    </div>
  );
}

function Steps({ label, items }: { label: string; items?: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="flex flex-col gap-1">
      <p className="type-label text-muted-foreground">{label}</p>
      <ul className="flex list-disc flex-col gap-1 pl-4 type-body">
        {items.map((t) => <li key={t}>{t}</li>)}
      </ul>
    </div>
  );
}

function RoutineMissing({ id }: { id: number }) {
  const regenerate = useRegenerateRoutine(id);
  return (
    <div className="flex flex-col items-start gap-3 rounded-panel border border-border bg-surface p-4">
      <p className="type-body text-muted-foreground">
        {regenerate.isPending ? "루틴을 만들고 있어요… 1분 정도 걸릴 수 있어요." : "루틴을 만들지 못했어요."}
      </p>
      {regenerate.isError && <p role="alert" className="type-caption text-destructive">{regenerate.error.message}</p>}
      <Button variant="secondary" size="cta" disabled={regenerate.isPending} onClick={() => regenerate.mutate()}>
        루틴 다시 만들기
      </Button>
    </div>
  );
}

function ApplyRoutine({ id, applied }: { id: number; applied: boolean }) {
  const router = useRouter();
  const apply = useApplyRoutine(id);
  if (applied) {
    return (
      <div>
        <Link href="/routine" className="flex h-[47px] items-center justify-center rounded-[14px] bg-secondary type-body font-semibold">
          루틴에서 확인하기
        </Link>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      <Button size="cta" disabled={apply.isPending} onClick={() => apply.mutate(undefined, { onSuccess: () => router.push("/routine") })}>
        {apply.isPending ? "시작하는 중…" : "이 루틴으로 관리 시작"}
      </Button>
      <p className="type-caption text-muted-foreground">1단계 아침·저녁 루틴이 오늘의 루틴이 돼요. 진행 중인 계획이 있으면 새 계획으로 바뀌어요.</p>
      {apply.isError && <p role="alert" className="type-caption text-destructive">{apply.error.message}</p>}
    </div>
  );
}
