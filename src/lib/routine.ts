"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";

export type PlanRequest = components["schemas"]["PlanRequest"];
export type PlanView = components["schemas"]["PlanView"];
export type TodayView = components["schemas"]["TodayView"];
export type GoalType = PlanRequest["goalType"];
export type FocusGoal = PlanRequest["focusGoal"];

// 문구는 Figma "루틴-관리 계획 수정"(목표일 설정) 그대로
export const GOAL_TYPES: { value: GoalType; label: string }[] = [
  { value: "VACATION", label: "휴가" },
  { value: "OUTING", label: "외출" },
  { value: "OVERNIGHT", label: "외박" },
  { value: "CUSTOM", label: "직접 입력" },
];

export const FOCUS_GOALS: { value: FocusGoal; label: string }[] = [
  { value: "BASIC_ROUTINE", label: "기본 루틴 꾸준히 이어가기" },
  { value: "PRODUCT_REACTION", label: "제품 사용 반응 확인하기" },
  { value: "SKIN_CHANGE", label: "피부 상태 변화 기록하기" },
];

export function goalName(plan: Pick<PlanView, "goalType" | "goalLabel">) {
  if (plan.goalType === "CUSTOM") return plan.goalLabel ?? "목표일";
  return GOAL_TYPES.find((g) => g.value === plan.goalType)?.label ?? "목표일";
}

export function dDay(daysLeft: number | undefined) {
  if (daysLeft === undefined) return "";
  return daysLeft === 0 ? "D-DAY" : `D-${daysLeft}`;
}

/** "2026-12-06" → "12월 6일" */
export function monthDay(isoDate: string | undefined) {
  if (!isoDate) return "";
  const [, m, d] = isoDate.split("-").map(Number);
  return `${m}월 ${d}일`;
}

const TODAY_KEY = ["routine", "today"];

/** 진행 중인 계획이 없으면 null */
export function useTodayRoutine(enabled: boolean) {
  return useQuery({
    queryKey: TODAY_KEY,
    enabled,
    queryFn: async () => {
      const { data, response } = await api.GET("/api/routines/today");
      if (response.status === 404) return null;
      if (!data) throw new Error(`routine failed: ${response.status}`);
      return data;
    },
  });
}

function errorMessage(error: unknown, status: number) {
  return (error as { detail?: string } | undefined)?.detail ?? `요청에 실패했어요 (${status})`;
}

export function useCreatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: PlanRequest) => {
      const { data, error, response } = await api.POST("/api/care-plans", { body });
      if (!data) throw new Error(errorMessage(error, response.status));
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["routine"] }),
  });
}

export function useToggleCheck() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ itemId, date, checked }: { itemId: number; date: string; checked: boolean }) => {
      const params = { params: { path: { itemId, date } } };
      const { error, response } = checked
        ? await api.PUT("/api/routine-items/{itemId}/checks/{date}", params)
        : await api.DELETE("/api/routine-items/{itemId}/checks/{date}", params);
      if (response.status !== 204) throw new Error(errorMessage(error, response.status));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TODAY_KEY }),
  });
}
