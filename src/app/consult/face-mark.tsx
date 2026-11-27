"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Region } from "@/lib/consult";
import { cn } from "@/lib/utils";

/** Figma 2-2 "얼굴표시"의 부위 13개. AI(Model A)는 부위를 6개만 받아서 가까운 부위로 바꿔 보낸다. */
export const FACE_AREAS: { label: string; region: Region | null }[] = [
  { label: "좌측 이마", region: "FOREHEAD" },
  { label: "중앙 이마", region: "FOREHEAD" },
  { label: "우측 이마", region: "FOREHEAD" },
  { label: "코", region: "NOSE" },
  { label: "왼 볼", region: "CHEEK_LEFT" },
  { label: "오른 볼", region: "CHEEK_RIGHT" },
  { label: "입가", region: "CHIN" },
  { label: "왼 턱", region: "CHIN" },
  { label: "오른 턱", region: "CHIN" },
  { label: "왼 턱선", region: "CHIN" },
  { label: "오른 턱선", region: "CHIN" },
  { label: "목", region: "CHIN" },
  { label: "기타", region: null },
];

/** 고른 부위 이름 → AI에 보낼 부위(중복 없이). "기타"는 보낼 부위가 없다. */
export function regionsOf(labels: string[]): Region[] {
  const out: Region[] = [];
  for (const area of FACE_AREAS) {
    if (labels.includes(area.label) && area.region && !out.includes(area.region)) out.push(area.region);
  }
  return out;
}

/**
 * Figma "2-2 현재 피부 고민 및 상태 파악" 얼굴표시 화면.
 * 아바타를 눌러 표시하는 기능은 개발 중이라, 아바타는 흐리게 보여 주고 아래 부위 칩으로 고른다.
 * "글로 설명할게요"를 누르면 기존 대화형 부위 질문으로 넘어간다.
 */
export function FaceMark({
  initial,
  onDone,
  onText,
}: {
  initial: string[];
  onDone: (labels: string[]) => void;
  onText: () => void;
}) {
  const [picked, setPicked] = useState<string[]>(initial);
  const onlyOther = picked.length > 0 && regionsOf(picked).length === 0;

  return (
    <main className="flex flex-1 flex-col gap-5 px-4 pt-6 pb-8">
      <div className="flex flex-col gap-1">
        <h2 className="type-title">어느 부위가 불편한가요?</h2>
        <p className="type-caption text-muted-foreground">내 아바타에서 불편한 곳을 눌러 표시해요.</p>
      </div>

      <div
        className="relative mx-auto flex h-[230px] w-[200px] items-center justify-center overflow-hidden rounded-panel border border-border bg-surface"
        aria-label="얼굴 아바타 (개발 중)"
        role="img"
      >
        <Image
          src="/images/consult-face.png"
          alt=""
          width={190}
          height={210}
          className="opacity-30 grayscale"
          priority
        />
        <span className="absolute inset-x-3 bottom-3 rounded-[11px] bg-background/90 px-3 py-2 text-center type-caption text-muted-foreground shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
          <span className="block type-label font-semibold text-foreground">개발 중인 서비스예요</span>
          아바타에 직접 표시하는 기능을 준비하고 있어요. 지금은 아래에서 골라 주세요.
        </span>
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 type-body-strong">주로 불편한 부위</legend>
        <div className="grid grid-cols-5 gap-1.5">
          {FACE_AREAS.map((area) => {
            const active = picked.includes(area.label);
            return (
              <button
                key={area.label}
                type="button"
                aria-pressed={active}
                onClick={() => setPicked((p) => (active ? p.filter((l) => l !== area.label) : [...p, area.label]))}
                className={cn(
                  "pressable h-[34px] rounded-[10px] px-1 type-caption",
                  active ? "bg-brand font-semibold" : "bg-secondary text-muted-foreground",
                )}
              >
                {area.label}
              </button>
            );
          })}
        </div>
        {onlyOther && (
          <p className="type-caption text-muted-foreground">기타 부위는 아래 &quot;글로 설명할게요&quot;로 알려 주세요.</p>
        )}
      </fieldset>

      <div className="mt-auto flex flex-col items-center gap-3 pt-4">
        <Button size="cta" className="w-full" disabled={regionsOf(picked).length === 0} onClick={() => onDone(picked)}>
          다음
        </Button>
        <button type="button" onClick={onText} className="type-caption text-muted-foreground underline">
          글로 설명할게요
        </button>
      </div>
    </main>
  );
}
