"use client";

import Link from "next/link";
import { Chip } from "@/components/app/chip";
import { useMe } from "@/lib/auth";
import { AXES, useLatestAssessment } from "@/lib/survey";

/** 결과 화면: 내 피부 특징 → 내 생활 환경 → 내 관리 방식 (Notion "피부 타입 구분 v2") */
export function SurveyResult() {
  const me = useMe();
  const { data, isPending, isError } = useLatestAssessment(Boolean(me.data));

  if (me.data === null) {
    return (
      <p className="px-4 py-8 type-body text-muted-foreground">
        결과를 보려면 로그인이 필요해요. <Link href="/login" className="underline">로그인하러 가기</Link>
      </p>
    );
  }
  if (me.isPending || isPending) return <p className="px-4 py-8 type-body text-muted-foreground">불러오는 중…</p>;
  if (isError) return <p className="px-4 py-8 type-body text-destructive">결과를 불러오지 못했어요.</p>;
  if (!data) {
    return (
      <p className="px-4 py-8 type-body text-muted-foreground">
        아직 진단 결과가 없어요. <Link href="/survey" className="underline">진단하러 가기</Link>
      </p>
    );
  }

  const borderline = (data.axes ?? []).filter((a) => a.borderline);

  return (
    <main className="flex flex-1 flex-col gap-4 px-4 py-6">
      <Section label="내 피부 특징">
        <p className="type-section" data-testid="result-title">{data.title}</p>
        <div className="flex flex-wrap gap-2">
          {(data.skinTags ?? []).slice(0, 2).map((t) => (
            <Chip key={t} variant="dark">{t}</Chip>
          ))}
        </div>
      </Section>

      {(data.environmentTags ?? []).length > 0 && (
        <Section label="내 생활 환경">
          <div className="flex flex-wrap gap-2">
            {data.environmentTags!.map((t) => (
              <Chip key={t} variant="outline">{t}</Chip>
            ))}
          </div>
        </Section>
      )}

      <Section label="내 관리 방식">
        <div><Chip variant="brand">{data.careStyleLabel}</Chip></div>
      </Section>

      {borderline.length > 0 && (
        <Section label="경계에 가까운 항목">
          <ul className="flex flex-col gap-2">
            {borderline.map((a) => {
              const meta = AXES.find((x) => x.axis === a.axis)!;
              return (
                <li key={a.axis} className="flex items-center gap-2 type-body">
                  <Chip variant="outline">경계</Chip>
                  {meta.title}: {meta.front}과 {meta.back} 사이
                </li>
              );
            })}
          </ul>
          {data.retestRecommendedAt && (
            <p className="type-caption text-muted-foreground">
              4주 동안 루틴을 해 본 뒤 {data.retestRecommendedAt}쯤 다시 진단해 보세요.
            </p>
          )}
        </Section>
      )}

      <Link href="/survey" className="mt-2 text-center type-body underline">
        다시 진단하기
      </Link>
    </main>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-card bg-surface p-4 shadow-[0_1px_4px_rgba(0,0,0,0.15)]">
      <h2 className="type-caption text-muted-foreground">{label}</h2>
      {children}
    </section>
  );
}
