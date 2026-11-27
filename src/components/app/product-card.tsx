"use client";

import Link from "next/link";
import { useState } from "react";
import { type ProductSummary, useToggleMyProduct, won } from "@/lib/products";
import { HeartButton } from "./heart-button";

/**
 * 제품 카드 (Figma "4-1제품추천"). 궁합 점수가 있으면 왼쪽 위에 배지.
 * matchScore를 넘기지 않으면 목록 API가 준 product.matchScore를 쓴다.
 */
export function ProductCard({ product, matchScore }: { product: ProductSummary; matchScore?: number | null }) {
  const toggle = useToggleMyProduct();
  const score = matchScore !== undefined ? matchScore : product.matchScore;
  // 하트는 누르는 즉시 바뀌고(서버 응답을 기다리지 않음), 실패하면 되돌린다. 목록이 새로 오면 그 값을 따른다.
  const [liked, setLiked] = useState(product.interested ?? false);
  const [fromServer, setFromServer] = useState(product.interested);
  if (product.interested !== fromServer) {
    setFromServer(product.interested);
    setLiked(product.interested ?? false);
  }
  return (
    <div className="pressable liftable relative flex flex-col overflow-hidden rounded-[20px] bg-surface shadow-[0_1px_4px_rgba(0,0,0,0.15)] has-[button:active]:transform-none">
      <Link href={`/products/${product.id}`} className="flex flex-col">
        <span className="flex h-[124px] items-center justify-center bg-surface">
          {product.imageUrl ? (
            // 제품 이미지는 외부 저장소 주소라 next/image 최적화 대상에서 뺀다.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.imageUrl} alt="" className="max-h-[110px] max-w-[80%] object-contain" />
          ) : (
            <span className="type-caption text-subtle-foreground">이미지 준비 중</span>
          )}
        </span>
        <span className="flex flex-col gap-0.5 border-t border-border px-3 py-3">
          <span className="type-caption text-subtle-foreground">{product.brand}</span>
          <span className="truncate type-body font-semibold">{product.name}</span>
          <span className="type-caption text-muted-foreground">
            {product.volume ? `${product.volume} | ` : ""}
            {won(product.price)}
          </span>
        </span>
      </Link>
      {score != null && (
        <span className="absolute top-2 left-2 rounded-[11px] bg-brand px-2 py-0.5 type-caption font-semibold">
          궁합 {score}점
        </span>
      )}
      <HeartButton
        liked={liked}
        label={liked ? `${product.name} 관심 해제` : `${product.name} 관심 등록`}
        className="absolute top-1.5 right-1.5"
        onToggle={(next) => {
          setLiked(next);
          toggle.mutate(
            { productId: product.id!, kind: "INTEREST", on: next },
            { onError: () => setLiked(!next) },
          );
        }}
      />
    </div>
  );
}
