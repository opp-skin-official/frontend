"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Chip } from "@/components/app/chip";
import { RequireLogin } from "@/components/app/require-login";
import { SectionHeader } from "@/components/app/section-header";
import { Button } from "@/components/ui/button";
import {
  type ConsultView,
  REGION_OPTIONS,
  type ReportView,
  type RoutineView,
  labelOf,
  useApplyRoutine,
  useConsultation,
  useRegenerateRoutine,
} from "@/lib/consult";

const DEFAULT_NOTICE = "이 안내는 피부 상태 관찰과 일상 관리 참고용이며, 의학적 판단이나 개선 보장이 아니에요.";

/**
 * R-01 관리 리포트: 원인·솔루션(Model A), 도움·주의 성분, 루틴(Model B), 관리 계획 시작.
 * Figma "피부보고1"·"솔루션" 화면은 아직 받지 못해 디자인 시스템 컴포넌트로 구성했다.
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
    <main className="flex flex-1 flex-col pb-10">
      <header className="flex flex-col gap-2 px-4 pt-10 pb-6">
        <p className="type-caption text-muted-foreground">
          {data.createdAt ? new Date(data.createdAt).toLocaleDateString("ko-KR", { month: "long", day: "numeric" }) : ""} 상담
        </p>
        <h2 className="type-title">{data.state === "REFERRED" ? "먼저 의료진 상담이 필요해요" : "이렇게 관리해 보세요"}</h2>
        <p className="type-body text-muted-foreground">{data.title}</p>
        {data.followsId != null && (
          <p className="type-caption text-muted-foreground">
            지난 상담을 이어서 지금 상황에 맞게 루틴을 다시 만들었어요.{" "}
            <Link href={`/consult/${data.followsId}`} className="underline">지난 리포트 보기</Link>
          </p>
        )}
      </header>
      {data.state === "REFERRED" || !data.report ? <Referral /> : <Report consult={data} report={data.report} />}
    </main>
  );
}

function Referral() {
  return (
    <div className="flex flex-col gap-4 px-4">
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

function regionsLabel(regions: string[] | undefined) {
  return (regions ?? []).map((r) => labelOf(REGION_OPTIONS, r as never) || r).join("·");
}

function Report({ consult, report }: { consult: ConsultView; report: ReportView }) {
  const pairs = report.pairs ?? [];
  const recommended = report.recommendedIngredients ?? [];
  const caution = report.cautionIngredients ?? [];
  return (
    <>
      <SectionHeader title="원인과 관리 방법" />
      <div className="flex flex-col gap-3 px-4 pt-1 pb-8">
        {pairs.length === 0 && (
          <p className="rounded-panel border border-border bg-surface p-4 type-body text-muted-foreground">
            근거가 충분한 안내를 찾지 못했어요. 증상이 계속되면 의무대나 의료기관에 상담해 주세요.
          </p>
        )}
        {pairs.map((p, i) => (
          <section key={i} className="flex flex-col gap-3 rounded-panel border border-border bg-surface px-5 py-5">
            {p.regions && p.regions.length > 0 && <Chip variant="brand" className="w-fit">{regionsLabel(p.regions)}</Chip>}
            <Row label="지금 상태" text={p.observation} />
            <Row label="원인" text={p.cause} />
            <Row label="이렇게 해 보세요" text={p.solution} strong />
          </section>
        ))}
        {report.referToClinician && (
          <p className="rounded-panel bg-brand px-5 py-4 type-body">
            {report.referralNotice ?? "일부 항목은 전문가 확인이 권장돼요. 가까운 의무대나 의료기관에 상담해 주세요."}
          </p>
        )}
      </div>

      {(recommended.length > 0 || caution.length > 0) && (
        <>
          <SectionHeader title="성분 참고" />
          <div className="flex flex-col gap-4 px-4 pt-1 pb-8">
            {recommended.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="type-body-strong">도움이 될 수 있는 성분</p>
                <div className="flex flex-wrap gap-1.5">
                  {recommended.map((g) => <Chip key={g.key} variant="brand">{g.labelKo ?? g.key}</Chip>)}
                </div>
              </div>
            )}
            {caution.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="type-body-strong">주의가 필요한 성분</p>
                <div className="flex flex-wrap gap-1.5">
                  {caution.map((g) => <Chip key={g.key} variant="outline">{g.labelKo ?? g.key}</Chip>)}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <SectionHeader title="추천 루틴" />
      <div className="px-4 pt-1 pb-6">
        {report.routine ? (
          <Routine routine={report.routine} />
        ) : (
          <RoutineMissing id={consult.id!} />
        )}
      </div>

      {report.routine && <ApplyRoutine id={consult.id!} applied={report.appliedPlanId != null} />}
      <p className="px-4 pt-6 type-caption text-subtle-foreground">{report.notice ?? DEFAULT_NOTICE}</p>
    </>
  );
}

function Row({ label, text, strong }: { label: string; text?: string; strong?: boolean }) {
  if (!text) return null;
  return (
    <div className="flex flex-col gap-1">
      <p className="type-label text-muted-foreground">{label}</p>
      <p className={strong ? "type-body-strong leading-[22px]" : "type-body"}>{text}</p>
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
      <div className="px-4">
        <Link href="/routine" className="flex h-[47px] items-center justify-center rounded-[14px] bg-secondary type-body font-semibold">
          루틴에서 확인하기
        </Link>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2 px-4">
      <Button size="cta" disabled={apply.isPending} onClick={() => apply.mutate(undefined, { onSuccess: () => router.push("/routine") })}>
        {apply.isPending ? "시작하는 중…" : "이 루틴으로 관리 시작"}
      </Button>
      <p className="type-caption text-muted-foreground">1단계 아침·저녁 루틴이 오늘의 루틴이 돼요. 진행 중인 계획이 있으면 새 계획으로 바뀌어요.</p>
      {apply.isError && <p role="alert" className="type-caption text-destructive">{apply.error.message}</p>}
    </div>
  );
}
