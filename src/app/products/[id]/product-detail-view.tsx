"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Chip } from "@/components/app/chip";
import { RequireLogin } from "@/components/app/require-login";
import { Button } from "@/components/ui/button";
import { useMorph } from "@/lib/morph";
import { SKIN_OPTIONS, useProductDetail, useToggleMyProduct, won } from "@/lib/products";
import { ReviewsSection } from "./reviews-section";

/** Figma "제품상세", "제품상세-성분". MY SKIN MATCH는 성분 매칭 이후. */
export function ProductDetailView() {
  return (
    <RequireLogin message="제품을 보려면 로그인이 필요해요.">
      {() => <Content />}
    </RequireLogin>
  );
}

function Content() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const valid = Number.isInteger(id) && id > 0;
  const { data, isPending, isError } = useProductDetail(id, valid);
  const toggle = useToggleMyProduct();
  const [showAll, setShowAll] = useState(false);
  const { panelRef: ingredientsRef, mounted: ingredientsMounted, capture: captureIngredients } =
    useMorph<HTMLParagraphElement>(showAll);

  if (!valid || data === null) return <p className="px-4 py-8 type-body text-muted-foreground">제품을 찾을 수 없어요.</p>;
  if (isPending) return <p className="px-4 py-8 type-body text-muted-foreground">불러오는 중…</p>;
  if (isError || !data) return <p className="px-4 py-8 type-body text-destructive">제품을 불러오지 못했어요.</p>;

  const skinLabels = (data.skinFits ?? []).map((s) => SKIN_OPTIONS.find((o) => o.value === s)?.label).filter(Boolean);

  return (
    <main className="flex flex-1 flex-col gap-6 pb-8">
      <div className="flex h-[260px] items-center justify-center bg-surface">
        {data.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data.imageUrl} alt="" className="max-h-[220px] max-w-[70%] object-contain" />
        ) : (
          <span className="type-caption text-subtle-foreground">이미지 준비 중</span>
        )}
      </div>
      <section className="flex flex-col gap-1 px-4">
        <span className="type-caption text-subtle-foreground">{data.brand}</span>
        <h2 className="type-section" data-testid="product-name">{data.name}</h2>
        <span className="type-body-strong">{won(data.price)}{data.volume ? ` · ${data.volume}` : ""}</span>
        {data.summary && <p className="mt-1 type-body text-muted-foreground">{data.summary}</p>}
      </section>

      {(data.recommendation || skinLabels.length > 0) && (
        <section className="mx-4 flex flex-col gap-2 rounded-panel border border-border bg-secondary px-5 py-4">
          <h3 className="type-body-strong">이런 분께 추천해요!</h3>
          {data.recommendation && <p className="type-body">{data.recommendation}</p>}
          {skinLabels.length > 0 && <p className="type-caption text-muted-foreground">{skinLabels.join(" · ")} 피부</p>}
        </section>
      )}

      {(data.keyIngredients ?? []).length > 0 && (
        <section className="flex flex-col gap-2 px-4">
          <h3 className="type-body-strong">주요 성분</h3>
          <ul className="flex flex-wrap gap-2">
            {data.keyIngredients!.map((i) => (
              <li key={i.nameKo}><Chip variant="outline" title={i.inci}>{i.nameKo}</Chip></li>
            ))}
          </ul>
        </section>
      )}

      {(data.features ?? []).length > 0 && (
        <section className="flex flex-col gap-2 px-4">
          <h3 className="type-body-strong">주요 특징</h3>
          <ul className="flex flex-wrap gap-2">
            {data.features!.map((f) => (
              <li key={f}><Chip variant="brand">{f}</Chip></li>
            ))}
          </ul>
        </section>
      )}

      {data.fullIngredients && (
        <section className="flex flex-col gap-2 px-4">
          <button
            type="button"
            aria-expanded={showAll}
            onClick={(e) => {
              captureIngredients(e.currentTarget);
              setShowAll(!showAll);
            }}
            className="flex justify-between type-body-strong"
          >
            전성분 <span aria-hidden>{showAll ? "−" : "+"}</span>
          </button>
          {ingredientsMounted && (
            <p ref={ingredientsRef} className="type-caption text-muted-foreground">{data.fullIngredients}</p>
          )}
        </section>
      )}

      <div className="grid grid-cols-2 gap-3 px-4">
        <Button
          variant="secondary"
          size="cta"
          aria-pressed={data.interested}
          disabled={toggle.isPending}
          onClick={() => toggle.mutate({ productId: data.id!, kind: "INTEREST", on: !data.interested })}
        >
          {data.interested ? "♥ 관심 제품" : "♡ 관심 제품"}
        </Button>
        <Button
          size="cta"
          aria-pressed={data.owned}
          disabled={toggle.isPending}
          onClick={() => toggle.mutate({ productId: data.id!, kind: "OWNED", on: !data.owned })}
        >
          {data.owned ? "보유 중 ✓" : "보유 제품에 추가"}
        </Button>
      </div>
      {toggle.isError && <p role="alert" className="px-4 type-caption text-destructive">{toggle.error.message}</p>}
      <ReviewsSection productId={data.id!} />
    </main>
  );
}
