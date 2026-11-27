"use client";

import Link from "next/link";
import { type Ref, useState } from "react";
import { ProductCard } from "@/components/app/product-card";
import { RequireLogin } from "@/components/app/require-login";
import { Button } from "@/components/ui/button";
import {
  CATEGORY_OPTIONS,
  PRICE_OPTIONS,
  type ProductFilters,
  SKIN_OPTIONS,
  SORT_OPTIONS,
  TABS,
  useProducts,
} from "@/lib/products";
import { useLatestAssessment } from "@/lib/survey";
import { useMorph } from "@/lib/morph";
import { cn } from "@/lib/utils";

/** Figma "4-1제품추천"(171:2219, 171:2371) */
export function ProductsView() {
  return (
    <RequireLogin message="제품을 보려면 로그인이 필요해요.">
      {() => <Content />}
    </RequireLogin>
  );
}

const EMPTY: ProductFilters = { categories: [], q: "", skins: [], prices: [], sort: "RECOMMENDED" };

function Content() {
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<ProductFilters>(EMPTY);
  const [sheetOpen, setSheetOpen] = useState(false);
  const { panelRef: sheetRef, mounted: sheetMounted, capture: captureSheet } = useMorph<HTMLDivElement>(sheetOpen);
  // 필터 시트에서 제품 유형을 고르면 탭보다 우선한다.
  const query = { ...filters, categories: filters.categories.length ? filters.categories : TABS[tab].categories };
  const products = useProducts(query, true);
  const items = products.data?.pages.flatMap((p) => p.items ?? []) ?? [];
  const activeFilterCount = filters.categories.length + filters.skins.length + filters.prices.length + (filters.sort !== "RECOMMENDED" ? 1 : 0);

  return (
    <main className="flex flex-1 flex-col gap-4 pb-8">
      <SkinTypeBanner />
      <div role="tablist" className="flex border-b border-border px-4">
        {TABS.map((t, i) => (
          <button
            key={t.label}
            role="tab"
            aria-selected={tab === i}
            onClick={() => {
              setTab(i);
              setFilters((f) => ({ ...f, categories: [] }));
            }}
            className={cn(
              "flex-1 py-3 type-body-strong",
              tab === i ? "border-b-2 border-foreground text-foreground" : "text-subtle-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <form
        className="flex gap-2 px-4"
        onSubmit={(e) => {
          e.preventDefault();
          setFilters((f) => ({ ...f, q: search.trim() }));
        }}
      >
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          maxLength={50}
          placeholder="제품명이나 키워드를 검색해보세요"
          aria-label="제품 검색"
          className="h-[42px] min-w-0 flex-1 rounded-full border border-border bg-surface px-4 type-body outline-none"
        />
        <button
          type="button"
          onClick={(e) => {
            captureSheet(e.currentTarget);
            setSheetOpen(true);
          }}
          aria-label={`제품 필터${activeFilterCount ? ` ${activeFilterCount}개 적용됨` : ""}`}
          className={cn(
            "h-[42px] rounded-full border px-4 type-caption",
            activeFilterCount ? "border-brand-strong bg-brand" : "border-border bg-surface",
          )}
        >
          필터{activeFilterCount ? ` ${activeFilterCount}` : ""}
        </button>
      </form>

      {products.isPending ? (
        <p className="px-4 type-body text-muted-foreground">불러오는 중…</p>
      ) : products.isError ? (
        <p className="px-4 type-body text-destructive">제품을 불러오지 못했어요.</p>
      ) : items.length === 0 ? (
        <p className="mx-4 rounded-card border border-border bg-surface p-4 type-body text-muted-foreground">
          {filters.q || activeFilterCount ? "조건에 맞는 제품이 없어요." : "등록된 PX 제품이 아직 없어요."}
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 px-4" aria-label="제품 목록">
          {items.map((p) => (
            <li key={p.id}>
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      )}
      {products.hasNextPage && (
        <div className="px-4">
          <Button variant="secondary" size="cta" className="w-full" disabled={products.isFetchingNextPage} onClick={() => products.fetchNextPage()}>
            {products.isFetchingNextPage ? "불러오는 중…" : "더 보기"}
          </Button>
        </div>
      )}
      {sheetMounted && (
        <FilterSheet
          panelRef={sheetRef}
          open={sheetOpen}
          initial={filters}
          onClose={() => setSheetOpen(false)}
          onApply={(f) => {
            setFilters({ ...f, q: filters.q });
            setSheetOpen(false);
          }}
        />
      )}
    </main>
  );
}

function SkinTypeBanner() {
  const { data } = useLatestAssessment(true);
  return (
    <section className="mx-4 mt-4 flex flex-col gap-1 rounded-card border border-border bg-gradient-to-r from-secondary to-brand px-5 py-4">
      <span className="flex items-center justify-between">
        <span className="type-body-strong">SKIN TYPE</span>
        <Link href="/survey" className="type-caption">{data ? "다시 진단 →" : "진단하기 →"}</Link>
      </span>
      <span className="type-body-strong">{data ? data.title : "아직 진단 전이에요"}</span>
      <span className="type-caption text-muted-foreground">
        {data ? "이 피부 유형을 참고해 제품을 추천해 드려요." : "진단하면 피부 유형에 맞춘 추천을 준비해요."}
      </span>
    </section>
  );
}

/** 필터 버튼이 스프링으로 부풀어 시트가 되고(useMorph), 닫으면 버튼 자리로 줄어든다. */
function FilterSheet({
  panelRef,
  open,
  initial,
  onClose,
  onApply,
}: {
  panelRef: Ref<HTMLDivElement>;
  open: boolean;
  initial: ProductFilters;
  onClose: () => void;
  onApply: (f: ProductFilters) => void;
}) {
  const [f, setF] = useState(initial);
  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-20 flex items-end justify-center bg-black/40 duration-300",
        open ? "animate-in fade-in-0" : "pointer-events-none animate-out fade-out-0 fill-mode-forwards",
      )}
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="제품 필터"
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-[402px] flex-col gap-5 rounded-t-[24px] bg-background px-5 pt-6 pb-8"
      >
        <div data-morph-item className="flex items-center justify-between">
          <h2 className="type-section">제품 필터</h2>
          <button type="button" aria-label="닫기" onClick={onClose} className="text-xl">×</button>
        </div>
        {/* 연속으로 눌러도 앞의 선택이 사라지지 않도록 이전 상태를 기준으로 갱신한다. */}
        <ChipGroup label="제품 유형" options={CATEGORY_OPTIONS} isOn={(v) => f.categories.includes(v)} onToggle={(v) => setF((p) => ({ ...p, categories: toggle(p.categories, v) }))} />
        <ChipGroup label="피부 특성" options={SKIN_OPTIONS} isOn={(v) => f.skins.includes(v)} onToggle={(v) => setF((p) => ({ ...p, skins: toggle(p.skins, v) }))} />
        <ChipGroup label="가격대" options={PRICE_OPTIONS} isOn={(v) => f.prices.includes(v)} onToggle={(v) => setF((p) => ({ ...p, prices: toggle(p.prices, v) }))} />
        <ChipGroup label="정렬" options={SORT_OPTIONS} isOn={(v) => f.sort === v} onToggle={(v) => setF((p) => ({ ...p, sort: v }))} />
        <div data-morph-item className="grid grid-cols-[auto_1fr] gap-3">
          <Button variant="secondary" size="cta" onClick={() => setF(EMPTY)}>초기화</Button>
          <Button size="cta" onClick={() => onApply(f)}>확인</Button>
        </div>
      </div>
    </div>
  );
}

function ChipGroup<T extends string>({
  label,
  options,
  isOn,
  onToggle,
}: {
  label: string;
  options: { value: T; label: string }[];
  isOn: (v: T) => boolean;
  onToggle: (v: T) => void;
}) {
  return (
    <fieldset data-morph-item className="flex flex-col gap-2">
      <legend className="mb-2 type-body-strong">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={isOn(o.value)}
            onClick={() => onToggle(o.value)}
            className={cn("rounded-[10px] px-3 py-1.5 type-body", isOn(o.value) ? "bg-brand" : "bg-secondary")}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
