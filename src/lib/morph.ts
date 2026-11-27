"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

/** 감쇠 스프링(약 0.6초, 8% 넘침)을 샘플링한 곡선 */
export const SPRING = `linear(0, 0.028, 0.1, 0.201, 0.318, 0.44, 0.559, 0.67, 0.769, 0.854, 0.924, 0.98, 1.021, 1.051,
  1.07, 1.08, 1.084, 1.081, 1.076, 1.067, 1.058, 1.047, 1.037, 1.028, 1.02, 1.013, 1.007, 1.002, 0.998, 0.996, 0.994,
  0.993, 0.993, 0.993, 0.994, 0.994, 1)`;
const OPEN_MS = 560;
const CLOSE_MS = 300;

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** 패널이 origin(누른 버튼) 자리·크기에서 출발하도록 하는 transform */
function fromRect(panel: DOMRect, origin: DOMRect) {
  const dx = origin.left - panel.left;
  const dy = origin.top - panel.top;
  const sx = Math.max(origin.width / panel.width, 0.05);
  const sy = Math.max(origin.height / panel.height, 0.05);
  return `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
}

function items(panel: HTMLElement) {
  return Array.from(panel.querySelectorAll<HTMLElement>("[data-morph-item]"));
}

/** 열기: 버튼이 스프링으로 부풀며 패널이 되고, 안의 항목([data-morph-item])이 차례로 나타난다. */
export function morphIn(panel: HTMLElement, origin: DOMRect | null) {
  if (reducedMotion()) return;
  // 닫히던 중에 다시 열면 남아 있는 닫기 동작(끝 상태 유지)을 지운다.
  panel.getAnimations({ subtree: true }).forEach((a) => a.cancel());
  const rect = panel.getBoundingClientRect();
  const start = origin ? fromRect(rect, origin) : "scale(0.92)";
  panel.animate(
    [
      { transform: start, transformOrigin: "0 0", opacity: origin ? 1 : 0 },
      { transform: "none", transformOrigin: "0 0", opacity: 1 },
    ],
    { duration: OPEN_MS, easing: SPRING },
  );
  items(panel).forEach((el, i) =>
    el.animate(
      [
        { opacity: 0, transform: "translateY(8px) scale(0.96)" },
        { opacity: 1, transform: "none" },
      ],
      { duration: 380, delay: 120 + i * 45, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)", fill: "backwards" },
    ),
  );
}

/** 닫기: 항목이 먼저 사라지고 패널이 버튼 자리로 줄어든다. 끝나면 resolve. */
export async function morphOut(panel: HTMLElement, origin: DOMRect | null) {
  if (reducedMotion()) return;
  const rect = panel.getBoundingClientRect();
  items(panel).forEach((el) =>
    el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, easing: "ease-out", fill: "forwards" }),
  );
  const shrink = panel.animate(
    [
      { transform: "none", transformOrigin: "0 0", opacity: 1 },
      { transform: origin ? fromRect(rect, origin) : "scale(0.92)", transformOrigin: "0 0", opacity: origin ? 0.6 : 0 },
    ],
    { duration: CLOSE_MS, easing: "cubic-bezier(0.4, 0, 0.6, 1)", fill: "forwards" },
  );
  await shrink.finished.catch(() => undefined);
}

/**
 * 버튼 → 패널 모프. open이 false가 돼도 닫히는 동작이 끝날 때까지 mounted를 유지한다.
 * 버튼 onClick에서 capture(e.currentTarget)를 부른 뒤 열면, 그 버튼 자리에서 열리고 닫을 때 그 자리로 돌아간다.
 */
export function useMorph<T extends HTMLElement>(open: boolean) {
  const panelRef = useRef<T>(null);
  const origin = useRef<DOMRect | null>(null);
  const [mounted, setMounted] = useState(open);
  if (open && !mounted) setMounted(true);

  useLayoutEffect(() => {
    if (open && mounted && panelRef.current) morphIn(panelRef.current, origin.current);
  }, [open, mounted]);

  useEffect(() => {
    if (open || !mounted) return;
    const panel = panelRef.current;
    let cancelled = false;
    void (panel ? morphOut(panel, origin.current) : Promise.resolve()).then(() => {
      if (!cancelled) setMounted(false);
    });
    return () => {
      cancelled = true;
    };
  }, [open, mounted]);

  return {
    panelRef,
    mounted,
    capture: (el: Element) => {
      origin.current = el.getBoundingClientRect();
    },
  };
}
