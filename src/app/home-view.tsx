"use client";

import Image from "next/image";
import Link from "next/link";
import { Chip } from "@/components/app/chip";
import { DotList } from "@/components/app/dot-list";
import { FocusCard } from "@/components/app/focus-card";
import { Icon } from "@/components/app/icon";
import { SectionHeader } from "@/components/app/section-header";
import { useMe } from "@/lib/auth";
import { useConversations } from "@/lib/chat";
import { useRecommendations } from "@/lib/products";
import { ProductCard } from "@/components/app/product-card";
import { useTodayRoutine } from "@/lib/routine";
import { useLatestAssessment } from "@/lib/survey";

/**
 * Figma "1. 홈"(499:808).
 * - 나의 집중 관리: 진행 중인 관리 계획의 D-day. 없으면 계획 만들기로 안내한다.
 * - 상담 시작은 문진 상담(/consult)으로 연결하고, 최근 상담은 문진 상담·피부 Q&A 목록을 보여 준다.
 * - 추천 상품은 맞춤 추천(피부 유형·최근 상담 리포트·주의 성분) 궁합 점수순 상위 2개.
 */
export function HomeView() {
  const me = useMe();
  const loggedIn = Boolean(me.data);

  return (
    <main className="flex flex-1 flex-col pb-8">
      <header className="px-4 pt-10 pb-6">
        <p className="type-title" data-testid="home-greeting">
          {me.data ? `안녕하세요, ${me.data.nickname ?? "사용자"}님` : "안녕하세요"}
          <br />
          오늘 피부는 어떤 상태인가요?
        </p>
        {me.data === null && (
          <Link href="/login" className="mt-3 inline-block type-body underline">
            로그인하고 시작하기
          </Link>
        )}
      </header>

      {loggedIn && (
        <>
          <SectionHeader title="나의 집중 관리" moreHref="/routine" moreLabel="루틴 보기" />
          <div className="px-4 pt-1 pb-8">
            <HomeFocus />
          </div>
        </>
      )}

      <SectionHeader title="대화 시작하기" />
      <div className="px-4 pt-3 pb-8">
        <ConsultCard />
      </div>

      <SectionHeader title="내 피부 정보" moreHref={loggedIn ? "/profile" : undefined} />
      <div className="px-4 pt-1 pb-8">
        {loggedIn ? <SkinInfoCard /> : <EmptyCard text="로그인하면 내 피부 정보를 볼 수 있어요." />}
      </div>

      <SectionHeader title="추천 상품" moreHref={loggedIn ? "/products" : undefined} />
      <div className="px-4 pt-1 pb-8">
        {loggedIn ? <RecommendedProducts /> : <EmptyCard text="로그인하면 피부에 맞는 PX 제품을 추천해 드려요." />}
      </div>

      <SectionHeader title="최근 상담 리스트" />
      <div className="px-4 pt-1">
        {loggedIn ? <RecentConversations /> : <EmptyCard text="로그인하면 상담 기록을 볼 수 있어요." />}
      </div>
    </main>
  );
}

/** 상담 시작 카드 → 문진 상담 (가벼운 질문은 하단 "챗봇" 탭) */
function ConsultCard() {
  return (
    <Link
      href="/consult"
      className="relative block h-[232px] overflow-hidden rounded-card bg-gradient-to-r from-secondary to-brand p-4"
    >
      <div className="flex items-start justify-between">
        <Icon name="chat-start" />
      </div>
      <p className="absolute top-[131px] left-4 type-body text-muted-foreground">
        AI 비서에게 불편한 점을
        <br />
        대화로 편하게 알려주세요.
      </p>
      <p className="absolute bottom-[27px] left-4 type-section">상담 시작하기</p>
      <Image
        src="/images/home-character.png"
        alt=""
        width={160}
        height={151}
        className="absolute top-[116px] left-[219px]"
      />
    </Link>
  );
}

function HomeFocus() {
  const { data, isPending } = useTodayRoutine(true);
  if (isPending) return <EmptyCard text="불러오는 중…" />;
  return <FocusCard plan={data?.plan} href={data ? "/routine" : "/routine/plan"} />;
}

function SkinInfoCard() {
  const { data, isPending } = useLatestAssessment(true);
  if (isPending) return <EmptyCard text="불러오는 중…" />;
  if (!data) {
    return (
      <Link
        href="/survey"
        className="flex items-center justify-between rounded-card bg-surface p-4 shadow-[0_1px_4px_rgba(0,0,0,0.15)]"
      >
        <span className="flex flex-col gap-1">
          <span className="text-[13px] leading-5 font-medium">피부 타입</span>
          <span className="type-body text-muted-foreground">진단하고 내 피부 유형을 알아보세요</span>
        </span>
        <Icon name="arrow-circle" />
      </Link>
    );
  }
  return (
    <Link
      href="/survey/result"
      className="flex flex-col gap-2 rounded-card bg-surface p-4 shadow-[0_1px_4px_rgba(0,0,0,0.15)]"
    >
      <span className="text-[13px] leading-5 font-medium">피부 타입</span>
      <span className="text-[20px] leading-6 font-medium">
        <DotList items={[data.title ?? "", data.careStyleLabel ?? ""]} />
      </span>
      <span className="flex flex-wrap gap-[11px]">
        {(data.skinTags ?? []).slice(0, 2).map((t) => (
          <Chip key={t} variant="dark">{t}</Chip>
        ))}
      </span>
    </Link>
  );
}

function RecommendedProducts() {
  const { data, isPending, isError } = useRecommendations({ limit: 2 }, true);
  if (isPending) return <EmptyCard text="불러오는 중…" />;
  if (isError) return <EmptyCard text="추천 상품을 불러오지 못했어요." />;
  if (!data || (data.items ?? []).length === 0) {
    return <EmptyCard text="피부 유형에 맞춘 PX 제품 추천을 준비하고 있어요." />;
  }
  return (
    <div className="flex flex-col gap-2">
      <div className="stagger grid grid-cols-2 gap-3">
        {(data.items ?? []).map((r) => <ProductCard key={r.product!.id} product={r.product!} matchScore={r.score} />)}
      </div>
      {!data.hasSkinType && (
        <Link href="/survey" className="type-caption text-muted-foreground underline">
          피부 유형 진단을 하면 궁합 점수를 볼 수 있어요
        </Link>
      )}
    </div>
  );
}

function RecentConversations() {
  const { data, isPending, isError } = useConversations(true, 5);
  if (isPending) return <EmptyCard text="불러오는 중…" />;
  if (isError) return <EmptyCard text="상담 기록을 불러오지 못했어요." />;
  const items = (data ?? []).filter((c) => c.title);
  if (items.length === 0) return <EmptyCard text="아직 상담 기록이 없어요." />;
  return (
    <ul className="flex flex-col gap-2">
      {items.map((c) => (
        <li key={c.id}>
          <Link
            href={c.kind === "CONSULT" ? `/consult/${c.id}` : `/chat/${c.id}`}
            className="flex items-center justify-between gap-3 rounded-card border border-border bg-surface p-4"
          >
            <span className="flex min-w-0 flex-col gap-1">
              <span className="truncate type-body-strong">{c.title}</span>
              <span className="type-caption text-muted-foreground">
                {c.kind === "CONSULT" ? "피부 상담 · " : "질문 · "}
                {c.updatedAt ? new Date(c.updatedAt).toLocaleDateString("ko-KR", { month: "long", day: "numeric" }) : ""}
              </span>
            </span>
            <Icon name="chevron-right" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

function EmptyCard({ text }: { text: string }) {
  return (
    <p className="rounded-card border border-border bg-surface p-4 type-body text-muted-foreground">{text}</p>
  );
}
