"use client";

import Link from "next/link";
import { type ProductSummary, useToggleMyProduct, won } from "@/lib/products";

/** 제품 카드 (Figma "4-1제품추천"). 매칭률 배지는 매칭 기능 이후에 붙인다. */
export function ProductCard({ product }: { product: ProductSummary }) {
  const toggle = useToggleMyProduct();
  return (
    <div className="relative flex flex-col overflow-hidden rounded-[20px] bg-surface shadow-[0_1px_4px_rgba(0,0,0,0.15)]">
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
      <button
        type="button"
        aria-label={product.interested ? `${product.name} 관심 해제` : `${product.name} 관심 등록`}
        aria-pressed={product.interested}
        disabled={toggle.isPending}
        onClick={() => toggle.mutate({ productId: product.id!, kind: "INTEREST", on: !product.interested })}
        className="absolute top-2 right-2 flex size-8 items-center justify-center text-lg"
      >
        {product.interested ? "♥" : "♡"}
      </button>
    </div>
  );
}
