"use client";

import { useRouter } from "next/navigation";
import { Icon } from "./icon";

/** 상단 바: 뒤로가기 · 가운데 제목 · 더보기. Figma 높이 72px(스테이터스 바 제외), 하단 구분선. */
export function TopBar({
  title,
  onMore,
}: {
  title: string;
  onMore?: () => void;
}) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-10 grid h-[72px] grid-cols-[48px_1fr_48px] items-center border-b border-border bg-background px-2">
      <button
        type="button"
        aria-label="뒤로 가기"
        onClick={() => router.back()}
        className="flex size-10 items-center justify-center"
      >
        <Icon name="back" />
      </button>
      <h1 className="text-center type-body-strong">{title}</h1>
      {onMore ? (
        <button
          type="button"
          aria-label="더보기"
          onClick={onMore}
          className="flex size-10 items-center justify-center"
        >
          <Icon name="more" />
        </button>
      ) : (
        <span />
      )}
    </header>
  );
}
