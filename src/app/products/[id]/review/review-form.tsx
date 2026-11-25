"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { RequireLogin } from "@/components/app/require-login";
import { Button } from "@/components/ui/button";
import { useProductDetail, won } from "@/lib/products";
import {
  SKIN_OPTION_LABELS,
  type ReviewView,
  type SkinOption,
  useDeleteReview,
  useReviewForm,
  useSaveReview,
} from "@/lib/reviews";
import { cn } from "@/lib/utils";

/** Figma "리뷰작성"(696:3747). 사진 첨부(최대 4장)는 파일 저장소(S3) 준비 후. */
export function ReviewFormView() {
  return (
    <RequireLogin message="리뷰를 쓰려면 로그인이 필요해요.">
      {() => <Loader />}
    </RequireLogin>
  );
}

function Loader() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const valid = Number.isInteger(id) && id > 0;
  const product = useProductDetail(id, valid);
  const form = useReviewForm(id, valid);
  if (!valid || product.data === null || form.data === null) {
    return <p className="px-4 py-8 type-body text-muted-foreground">제품을 찾을 수 없어요.</p>;
  }
  if (product.isPending || form.isPending) return <p className="px-4 py-8 type-body text-muted-foreground">불러오는 중…</p>;
  if (!product.data || !form.data) return <p className="px-4 py-8 type-body text-destructive">불러오지 못했어요.</p>;
  return (
    <Form
      productId={id}
      productName={product.data.name ?? ""}
      brand={product.data.brand ?? ""}
      price={product.data.price}
      goodOptions={form.data.goodTagOptions ?? []}
      badOptions={form.data.badTagOptions ?? []}
      initial={form.data.myReview ?? undefined}
    />
  );
}

function Form({
  productId,
  productName,
  brand,
  price,
  goodOptions,
  badOptions,
  initial,
}: {
  productId: number;
  productName: string;
  brand: string;
  price: number | undefined;
  goodOptions: string[];
  badOptions: string[];
  initial?: ReviewView;
}) {
  const router = useRouter();
  const save = useSaveReview(productId);
  const remove = useDeleteReview(productId);
  const [rating, setRating] = useState(initial?.rating ?? 0);
  const [content, setContent] = useState(initial?.content ?? "");
  const [skin, setSkin] = useState<SkinOption | undefined>(initial?.skinOption);
  const [good, setGood] = useState<string[]>(initial?.goodTags ?? []);
  const [bad, setBad] = useState<string[]>(initial?.badTags ?? []);
  const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const ready = rating >= 1 && content.trim().length > 0;
  const back = () => router.push(`/products/${productId}`);

  return (
    <main className="flex flex-1 flex-col gap-7 px-4 py-6">
      <section className="flex flex-col gap-0.5">
        <span className="type-caption text-subtle-foreground">{brand}</span>
        <span className="type-body-strong">{productName}</span>
        <span className="type-caption text-muted-foreground">{won(price)}</span>
      </section>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 type-body-strong">평점을 남겨주세요.</legend>
        <div role="radiogroup" aria-label="평점" className="flex gap-1 text-[32px] leading-none">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n}점`}
              onClick={() => setRating(n)}
              className={n <= rating ? "text-foreground" : "text-border"}
            >
              ★
            </button>
          ))}
        </div>
      </fieldset>

      <label className="flex flex-col gap-2">
        <span className="type-body-strong">리뷰를 작성해주세요.</span>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={500}
          rows={5}
          placeholder="제품을 사용한 후기를 남겨주세요!"
          className="rounded-[14px] border border-border bg-surface p-4 type-body outline-none"
        />
        <span className="self-end type-caption text-muted-foreground">{content.length}/500</span>
      </label>

      <Chips label="구매 옵션을 선택해주세요. (선택사항)" options={SKIN_OPTION_LABELS.map((o) => o.label)} isOn={(l) => skinOf(l) === skin} onToggle={(l) => setSkin(skinOf(l) === skin ? undefined : skinOf(l))} />
      <Chips label="이런 점이 좋았어요!" options={goodOptions} isOn={(t) => good.includes(t)} onToggle={(t) => setGood((g) => toggle(g, t))} />
      <Chips label="이런 점은 아쉬워요" options={badOptions} isOn={(t) => bad.includes(t)} onToggle={(t) => setBad((b) => toggle(b, t))} />

      {(save.isError || remove.isError) && (
        <p role="alert" className="type-body text-destructive">{(save.error ?? remove.error)?.message}</p>
      )}
      <div className="flex flex-col gap-3">
        <Button
          size="cta"
          disabled={!ready || save.isPending}
          onClick={() =>
            save.mutate(
              { rating, content, skinOption: skin, goodTags: good, badTags: bad },
              { onSuccess: back },
            )
          }
        >
          {save.isPending ? "저장 중…" : initial ? "고치기" : "등록하기"}
        </Button>
        {initial && (
          <Button variant="secondary" size="cta" disabled={remove.isPending} onClick={() => remove.mutate(undefined, { onSuccess: back })}>
            리뷰 삭제
          </Button>
        )}
      </div>
    </main>
  );
}

function skinOf(label: string) {
  return SKIN_OPTION_LABELS.find((o) => o.label === label)?.value;
}

function Chips({
  label,
  options,
  isOn,
  onToggle,
}: {
  label: string;
  options: string[];
  isOn: (v: string) => boolean;
  onToggle: (v: string) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 type-body-strong">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            aria-pressed={isOn(o)}
            onClick={() => onToggle(o)}
            className={cn("rounded-[10px] px-3 py-1.5 type-body", isOn(o) ? "bg-brand" : "bg-secondary")}
          >
            {o}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
