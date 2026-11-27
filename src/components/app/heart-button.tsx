"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

const HEART =
  "M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5";
const BOUNCE = "var(--ease-bounce)";

/**
 * 관심 하트. 마우스를 올리면 커지고, 누르면 눌리고, 관심 등록 순간 톡 튀며 작은 점들이 퍼진다.
 * 상태(liked)는 부모가 바로 바꿔 서버 응답을 기다리지 않게 한다.
 */
export function HeartButton({
  liked,
  onToggle,
  label,
  className,
}: {
  liked: boolean;
  onToggle: (next: boolean) => void;
  label: string;
  className?: string;
}) {
  const iconRef = useRef<SVGSVGElement>(null);
  const burstRef = useRef<HTMLSpanElement>(null);

  function celebrate(next: boolean) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const icon = iconRef.current;
    // CSS 변수 곡선은 Web Animations에 바로 못 넣어서 계산된 값을 쓴다.
    const bounce = getComputedStyle(document.documentElement).getPropertyValue("--ease-bounce").trim() || "ease-out";
    icon?.animate(next ? [{ scale: 0.55 }, { scale: 1 }] : [{ scale: 0.8 }, { scale: 1 }], {
      duration: next ? 620 : 380,
      easing: bounce,
    });
    if (!next || !burstRef.current) return;
    // 하트 주위로 점 6개가 퍼졌다가 사라진다.
    Array.from(burstRef.current.children).forEach((dot, i) => {
      const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(angle) * 16;
      const y = Math.sin(angle) * 16;
      dot.animate(
        [
          { translate: "0 0", scale: 0.4, opacity: 1 },
          { translate: `${x}px ${y}px`, scale: 1, opacity: 1, offset: 0.6 },
          { translate: `${x * 1.25}px ${y * 1.25}px`, scale: 0, opacity: 0 },
        ],
        { duration: 520, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
      );
    });
  }

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={liked}
      onClick={(e) => {
        e.preventDefault();
        const next = !liked;
        onToggle(next);
        celebrate(next);
      }}
      className={cn(
        "pressable relative flex size-9 items-center justify-center rounded-full text-foreground",
        "hover:scale-110 hover:bg-black/5 active:scale-90",
        className,
      )}
    >
      <span ref={burstRef} aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
        {Array.from({ length: 6 }, (_, i) => (
          <span key={i} className="absolute size-1.5 rounded-full bg-black opacity-0" />
        ))}
      </span>
      <svg ref={iconRef} width="22" height="22" viewBox="0 0 24 24" aria-hidden data-liked={liked}>
        <path
          d={HEART}
          fill={liked ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transition: `fill 160ms ${BOUNCE}` }}
        />
      </svg>
    </button>
  );
}
