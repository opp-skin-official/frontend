"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";

export type RecordRequest = components["schemas"]["RecordRequest"];
export type RecordView = components["schemas"]["RecordView"];
export type PerceivedChange = RecordRequest["perceivedChange"];
export type SkinCondition = RecordRequest["skinCondition"];

// IA "경과 기록 기준"
export const CHANGE_OPTIONS: { value: PerceivedChange; label: string }[] = [
  { value: "BETTER", label: "나아진 것 같아요" },
  { value: "SAME", label: "비슷해요" },
  { value: "WORSE", label: "더 불편해요" },
  { value: "UNSURE", label: "잘 모르겠어요" },
];

// Figma "내가 기록한 피부 컨디션"
export const CONDITION_OPTIONS: { value: SkinCondition; label: string }[] = [
  { value: "COMFORT", label: "편안" },
  { value: "NORMAL", label: "보통" },
  { value: "UNCOMFORTABLE", label: "불편" },
];

/** IA "경과 기록 기준"의 "화면에서 이어줄 행동" */
export const FOLLOW_UP: Record<PerceivedChange, { message: string; link?: { href: string; label: string } }> = {
  BETTER: {
    message: "달라진 점을 확인하고, 지금 계획을 이어갈지 정해 보세요.",
    link: { href: "/routine/plan", label: "계획 바꾸기" },
  },
  SAME: {
    message: "기록 기간과 실제로 실천한 횟수를 보고, 유지할지 조정할지 살펴봐요.",
    link: { href: "/routine/progress", label: "관리 경과 보기" },
  },
  WORSE: {
    message:
      "달라진 증상과 상황을 AI 비서에게 물어보세요. 증상이 심하거나 오래가면 의무실이나 의료진과 상담하세요.",
    link: { href: "/chat", label: "AI 비서에게 물어보기" },
  },
  UNSURE: {
    message: "메모로 느낀 점을 더 남겨 주세요. 기록이 부족하면 판단을 미뤄 둘게요.",
  },
};

export const labelOf = <T extends string>(options: { value: T; label: string }[], value: T | undefined) =>
  options.find((o) => o.value === value)?.label;

export function useProgressRecords(from: string | undefined, to: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ["progress", from, to],
    enabled: enabled && Boolean(from && to),
    queryFn: async () => {
      const { data, response } = await api.GET("/api/progress-records", {
        params: { query: { from: from!, to: to! } },
      });
      if (!data) throw new Error(`progress failed: ${response.status}`);
      return data;
    },
  });
}

export function useSaveRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ date, body }: { date: string; body: RecordRequest }) => {
      const { data, error, response } = await api.PUT("/api/progress-records/{date}", {
        params: { path: { date } },
        body,
      });
      if (!data) {
        throw new Error((error as { detail?: string } | undefined)?.detail ?? `요청에 실패했어요 (${response.status})`);
      }
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["progress"] }),
  });
}
