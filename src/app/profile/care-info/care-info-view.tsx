"use client";

import Link from "next/link";
import { useState } from "react";
import { RequireLogin } from "@/components/app/require-login";
import { Button } from "@/components/ui/button";
import {
  ALLERGY_OPTIONS,
  OUTDOOR_TRAINING_OPTIONS,
  WASH_TIME_OPTIONS,
  labelOf,
  useAddAlert,
  useCareInfo,
  useDeleteAlert,
} from "@/lib/care-info";

/** Figma "3-4기타정보상세"(395:1470): CARE ENVIRONMENT, SKIN ALERT. MY PRODUCTS는 제품 DB 이후. */
export function CareInfoView() {
  return (
    <RequireLogin message="기타 정보를 보려면 로그인이 필요해요.">
      {() => <CareInfoContent />}
    </RequireLogin>
  );
}

function CareInfoContent() {
  const { data, isPending, isError } = useCareInfo(true);
  if (isPending) return <p className="px-4 py-8 type-body text-muted-foreground">불러오는 중…</p>;
  if (isError || !data) return <p className="px-4 py-8 type-body text-destructive">정보를 불러오지 못했어요.</p>;
  const env = data.environment;

  return (
    <main className="flex flex-1 flex-col gap-5 px-4 py-6">
      <section className="flex flex-col gap-4 rounded-panel border border-border bg-secondary px-[22px] py-5">
        <div className="flex items-center justify-between">
          <h2 className="type-body-strong">CARE ENVIRONMENT</h2>
          <Link href="/profile/care-info/environment" className="type-caption underline">
            {env ? "수정" : "입력하기"}
          </Link>
        </div>
        {env ? (
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
            <Row label="세안 가능 시간" value={labelOf(WASH_TIME_OPTIONS, env.washTime)} />
            <Row label="야외훈련 빈도" value={labelOf(OUTDOOR_TRAINING_OPTIONS, env.outdoorTraining)} />
            <Row label="알레르기·자극 경험" value={labelOf(ALLERGY_OPTIONS, env.allergyExperience)} />
          </dl>
        ) : (
          <p className="type-caption text-muted-foreground">세안 가능한 시간과 야외훈련 빈도를 알려 주세요.</p>
        )}
      </section>
      <SkinAlerts alerts={data.alerts ?? []} />
    </main>
  );
}

function Row({ label, value }: { label: string; value: string | undefined }) {
  return (
    <>
      <dt className="type-caption text-muted-foreground">{label}</dt>
      <dd className="type-body">{value}</dd>
    </>
  );
}

function SkinAlerts({ alerts }: { alerts: { id?: number; target?: string }[] }) {
  const [target, setTarget] = useState("");
  const add = useAddAlert();
  const remove = useDeleteAlert();

  return (
    <section className="flex flex-col gap-4 rounded-panel border border-border bg-secondary px-[22px] py-5">
      <h2 className="type-body-strong">SKIN ALERT</h2>
      <p className="type-caption text-muted-foreground">
        특정 제품이나 성분에 알레르기·자극을 경험했다면 입력해 주세요. 추천에서 빼고 주의 목록에 먼저 보여 드려요.
      </p>
      {alerts.length > 0 && (
        <ul className="flex flex-col gap-2" aria-label="주의 성분 목록">
          {alerts.map((a) => (
            <li key={a.id} className="flex items-center justify-between rounded-[14px] bg-surface px-4 py-3">
              <span className="flex items-center gap-2 type-body">
                {a.target}
                <span className="rounded-[11px] bg-brand px-2 type-caption">주의</span>
              </span>
              <button
                type="button"
                aria-label={`${a.target} 삭제`}
                onClick={() => remove.mutate(a.id!)}
                disabled={remove.isPending}
                className="px-2 type-body text-muted-foreground"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!target.trim()) return;
          add.mutate(target, { onSuccess: () => setTarget("") });
        }}
      >
        <input
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="제품명 또는 성분을 입력해주세요."
          aria-label="주의 성분 입력"
          maxLength={100}
          className="h-[47px] min-w-0 flex-1 rounded-[14px] border border-border bg-surface px-4 type-body outline-none"
        />
        <Button type="submit" size="cta" disabled={!target.trim() || add.isPending}>
          추가
        </Button>
      </form>
      {add.isError && <p role="alert" className="type-caption text-destructive">{add.error.message}</p>}
    </section>
  );
}
