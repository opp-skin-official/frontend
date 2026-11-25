"use client";

import Link from "next/link";
import { useState } from "react";
import { RequireLogin } from "@/components/app/require-login";
import { type MyProductKind, useMyProducts, useToggleMyProduct, won } from "@/lib/products";
import { cn } from "@/lib/utils";

const TABS: { label: string; kind: MyProductKind | undefined }[] = [
  { label: "전체", kind: undefined },
  { label: "구매한 제품", kind: "OWNED" },
  { label: "관심 제품", kind: "INTEREST" },
];

/** Figma "내 보유제품"(696:3045): 전체 / 구매한 제품 / 관심 제품 */
export function MyProductsView() {
  return (
    <RequireLogin message="내 보유제품을 보려면 로그인이 필요해요.">
      {() => <Content />}
    </RequireLogin>
  );
}

function Content() {
  const [tab, setTab] = useState(0);
  const { data, isPending, isError } = useMyProducts(TABS[tab].kind, true);
  const toggle = useToggleMyProduct();

  return (
    <main className="flex flex-1 flex-col gap-4 pb-8">
      <div role="tablist" className="flex border-b border-border px-4">
        {TABS.map((t, i) => (
          <button
            key={t.label}
            role="tab"
            aria-selected={tab === i}
            onClick={() => setTab(i)}
            className={cn("flex-1 py-3 type-body-strong", tab === i ? "border-b-2 border-foreground" : "text-subtle-foreground")}
          >
            {t.label}
          </button>
        ))}
      </div>
      {isPending ? (
        <p className="px-4 type-body text-muted-foreground">불러오는 중…</p>
      ) : isError ? (
        <p className="px-4 type-body text-destructive">불러오지 못했어요.</p>
      ) : (data ?? []).length === 0 ? (
        <p className="mx-4 rounded-card border border-border bg-surface p-4 type-body text-muted-foreground">
          아직 등록한 제품이 없어요. <Link href="/products" className="underline">제품 둘러보기</Link>
        </p>
      ) : (
        <ul className="flex flex-col gap-2 px-4" aria-label="내 보유제품 목록">
          {data!.map((m) => (
            <li key={`${m.productId}-${m.kind}`} className="flex items-center gap-3 rounded-panel border border-border bg-surface p-3">
              <Link href={`/products/${m.productId}`} className="flex min-w-0 flex-1 flex-col">
                <span className="type-caption text-subtle-foreground">{m.product?.brand}</span>
                <span className="truncate type-body font-semibold">{m.product?.name}</span>
                <span className="type-caption text-muted-foreground">
                  {m.kind === "OWNED" ? "구매한 제품" : "관심 제품"} · {won(m.product?.price)}
                </span>
              </Link>
              <button
                type="button"
                aria-label={`${m.product?.name} ${m.kind === "OWNED" ? "보유" : "관심"} 해제`}
                disabled={toggle.isPending}
                onClick={() => toggle.mutate({ productId: m.productId!, kind: m.kind!, on: false })}
                className="px-2 type-body text-muted-foreground"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
