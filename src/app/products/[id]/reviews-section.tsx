"use client";

import Link from "next/link";
import { Stars } from "@/components/app/stars";
import { Button } from "@/components/ui/button";
import { skinOptionLabel, timeAgo, useReviews } from "@/lib/reviews";

/** 제품 상세의 전체리뷰 (Figma "제품상세-성분"): 평균 별점(개수), 리뷰 목록 */
export function ReviewsSection({ productId }: { productId: number }) {
  const reviews = useReviews(productId, true);
  const first = reviews.data?.pages[0];
  const items = reviews.data?.pages.flatMap((p) => p.items ?? []) ?? [];
  const mine = items.find((r) => r.mine);

  return (
    <section className="flex flex-col gap-3 px-4" aria-label="전체 리뷰">
      <div className="flex items-center justify-between">
        <h3 className="type-body-strong">
          전체리뷰{" "}
          {first && (first.count ?? 0) === 0 && <span className="text-subtle-foreground">(0)</span>}
          {first && (first.count ?? 0) > 0 && (
            <span className="text-subtle-foreground">
              <Stars value={first.average ?? 0} className="text-sm text-foreground" /> {(first.average ?? 0).toFixed(1)}(
              {first.count})
            </span>
          )}
        </h3>
        <Link href={`/products/${productId}/review`} className="type-caption underline">
          {mine ? "내 리뷰 고치기" : "리뷰 작성"}
        </Link>
      </div>
      {reviews.isPending ? (
        <p className="type-body text-muted-foreground">불러오는 중…</p>
      ) : items.length === 0 ? (
        <p className="rounded-panel border border-border bg-surface p-4 type-body text-muted-foreground">
          아직 리뷰가 없어요. 첫 리뷰를 남겨 보세요.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((r) => (
            <li key={r.id} className="flex flex-col gap-1.5 rounded-panel border border-border bg-surface p-4">
              <span className="flex items-center gap-2 type-caption">
                <span className="type-body font-semibold">{r.nickname ?? "사용자"}</span>
                <Stars value={r.rating ?? 0} />
                <span className="text-subtle-foreground">{timeAgo(r.createdAt)}</span>
                {r.mine && <span className="rounded-[8px] bg-brand px-1.5">내 리뷰</span>}
              </span>
              {r.skinOption && <span className="type-caption text-muted-foreground">{skinOptionLabel(r.skinOption)}</span>}
              <p className="type-body whitespace-pre-line">{r.content}</p>
              {((r.goodTags ?? []).length > 0 || (r.badTags ?? []).length > 0) && (
                <span className="flex flex-wrap gap-1.5 type-caption">
                  {(r.goodTags ?? []).map((t) => <span key={t} className="rounded-[8px] bg-brand px-2 py-0.5">{t}</span>)}
                  {(r.badTags ?? []).map((t) => <span key={t} className="rounded-[8px] bg-secondary px-2 py-0.5">{t}</span>)}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
      {reviews.hasNextPage && (
        <Button variant="secondary" size="cta" disabled={reviews.isFetchingNextPage} onClick={() => reviews.fetchNextPage()}>
          리뷰 더 보기
        </Button>
      )}
    </section>
  );
}
