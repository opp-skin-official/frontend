"use client";

import Link from "next/link";
import { Chip } from "@/components/app/chip";
import { RequireLogin } from "@/components/app/require-login";
import {
  OUTDOOR_TRAINING_OPTIONS,
  WASH_TIME_OPTIONS,
  labelOf,
  useCareInfo,
} from "@/lib/care-info";
import { useLatestAssessment } from "@/lib/survey";

/** Figma "피부프로필- 피부"(171:1219): 프로필 카드 → 피부 유형 → CARE INFO */
export function ProfileView() {
  return (
    <RequireLogin message="프로필을 보려면 로그인이 필요해요.">
      {(me) => (
        <main className="flex flex-1 flex-col gap-5 px-4 py-6">
          <section className="flex flex-col gap-4 rounded-[25px] border border-border bg-secondary p-[18px]">
            <div className="relative h-[124px] rounded-panel border border-border bg-gradient-to-r from-secondary to-brand">
              <div className="absolute -bottom-10 left-[19px] size-[104px] overflow-hidden rounded-full border border-border bg-surface">
                {me.profileImageUrl ? (
                  // 카카오 프로필 사진(외부 주소)이라 next/image 최적화 대상에서 뺀다.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={me.profileImageUrl} alt="" className="size-full object-cover" />
                ) : (
                  <span className="flex size-full items-center justify-center type-section text-muted-foreground">
                    {me.nickname?.slice(0, 1) ?? "?"}
                  </span>
                )}
              </div>
            </div>
            <p className="mt-10 type-body font-semibold" data-testid="profile-nickname">
              {me.nickname ?? "사용자"}
            </p>
          </section>
          <SkinTypeCard />
          <CareInfoCard />
          <CardLink href="/profile/products" title="MY PRODUCTS">
            <span className="type-caption text-muted-foreground">구매한 제품과 관심 제품을 모아 봐요.</span>
          </CardLink>
        </main>
      )}
    </RequireLogin>
  );
}

function CardLink({ href, title, children }: { href: string; title: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="flex flex-col gap-3 rounded-panel border border-border bg-secondary px-[26px] py-4">
      <span className="flex items-center justify-between type-body-strong">
        {title}
        <span aria-hidden>→</span>
      </span>
      {children}
    </Link>
  );
}

function SkinTypeCard() {
  const { data, isPending } = useLatestAssessment(true);
  if (isPending) return null;
  if (!data) {
    return (
      <CardLink href="/survey" title="SKIN TYPE">
        <span className="type-caption text-muted-foreground">
          피부 유형 진단을 하면 맞춤 관리를 받을 수 있어요.
        </span>
      </CardLink>
    );
  }
  return (
    <CardLink href="/survey/result" title="SKIN TYPE">
      <span className="text-[24px] leading-[normal] font-semibold">{data.title}</span>
      <span className="flex flex-wrap gap-2">
        {(data.skinTags ?? []).slice(0, 2).map((t) => (
          <Chip key={t} variant="dark">{t}</Chip>
        ))}
        <Chip variant="brand">{data.careStyleLabel}</Chip>
      </span>
    </CardLink>
  );
}

function CareInfoCard() {
  const { data, isPending } = useCareInfo(true);
  if (isPending) return null;
  const env = data?.environment;
  const alerts = data?.alerts ?? [];
  return (
    <CardLink href="/profile/care-info" title="CARE INFO">
      {env ? (
        <span className="grid grid-cols-2 gap-x-3 gap-y-4">
          <Item label="CARE ENVIRONMENT" value={`${labelOf(WASH_TIME_OPTIONS, env.washTime)} 세안`} />
          <Item label="야외훈련" value={labelOf(OUTDOOR_TRAINING_OPTIONS, env.outdoorTraining) ?? ""} />
          <Item
            label="SKIN ALERT"
            value={alerts.length === 0 ? "등록한 주의 성분 없음" : `${alerts[0].target}${alerts.length > 1 ? ` 외 ${alerts.length - 1}개` : ""}`}
          />
        </span>
      ) : (
        <span className="type-caption text-muted-foreground">
          맞춤 관리를 위해 생활 환경과 주의 성분을 등록해 보세요!
        </span>
      )}
    </CardLink>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex flex-col gap-1">
      <span className="type-body">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </span>
  );
}
