"use client";

import { useLayoutEffect, useRef, ViewTransition } from "react";
import { SPRING } from "@/lib/morph";

/** 마지막 뒤로/앞으로 가기(popstate) 시각. 그 직후 그려진 페이지는 뒤로 간 것으로 본다. */
let lastPopState = 0;
if (typeof window !== "undefined") {
  window.addEventListener("popstate", () => {
    lastPopState = performance.now();
  });
}

/**
 * 페이지 이동 모션. template은 이동할 때마다 새로 그려진다.
 * - 링크·탭 이동: React ViewTransition으로 이전 페이지는 흐려지고 새 페이지는 떠오르며 나타난다(globals.css의 .page).
 * - 뒤로 가기(브라우저·상단 바): Next가 화면 전환 없이 바로 바꾸므로, 그려진 직후 왼쪽에서 밀려 들어오게 한다.
 * 동작 줄이기 설정이거나 브라우저가 지원하지 않으면 그냥 바로 바뀐다.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || performance.now() - lastPopState > 1000) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.animate(
      [
        { opacity: 0, translate: "-40px 0" },
        { opacity: 1, translate: "0 0" },
      ],
      { duration: 420, easing: SPRING },
    );
  }, []);

  return (
    <ViewTransition enter="page" exit="page" default="none">
      <div ref={ref} className="flex w-full flex-1 flex-col">
        {children}
      </div>
    </ViewTransition>
  );
}
