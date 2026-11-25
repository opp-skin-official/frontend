"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";

export type CareInfo = components["schemas"]["CareInfoView"];
export type EnvironmentRequest = components["schemas"]["EnvironmentRequest"];
export type WashTime = EnvironmentRequest["washTime"];
export type OutdoorTraining = EnvironmentRequest["outdoorTraining"];
export type AllergyExperience = EnvironmentRequest["allergyExperience"];

// 선택지 문구는 Figma "3-4 기타정보-생활환경", "알레르기수정" 화면 그대로
export const WASH_TIME_OPTIONS: { value: WashTime; label: string }[] = [
  { value: "MORNING_EVENING", label: "아침 · 저녁" },
  { value: "EVENING_ONLY", label: "저녁만 가능" },
  { value: "VARIES", label: "일정에 따라 다름" },
  { value: "NO_FIXED_TIME", label: "정해진 시간 없음" },
];

export const OUTDOOR_TRAINING_OPTIONS: { value: OutdoorTraining; label: string }[] = [
  { value: "ALMOST_DAILY", label: "거의 매일" },
  { value: "TWO_TO_THREE_PER_WEEK", label: "주 2~3회" },
  { value: "WEEKLY_OR_LESS", label: "주 1회 이하" },
  { value: "IRREGULAR", label: "불규칙해요" },
];

export const ALLERGY_OPTIONS: { value: AllergyExperience; label: string }[] = [
  { value: "YES", label: "있다" },
  { value: "NO", label: "없다" },
  { value: "UNKNOWN", label: "모르겠다" },
];

export const labelOf = <T extends string>(options: { value: T; label: string }[], value: T | undefined) =>
  options.find((o) => o.value === value)?.label;

const KEY = ["care-info"];

export function useCareInfo(enabled: boolean) {
  return useQuery({
    queryKey: KEY,
    enabled,
    queryFn: async () => {
      const { data, response } = await api.GET("/api/care-info");
      if (!data) throw new Error(`care-info failed: ${response.status}`);
      return data;
    },
  });
}

function errorMessage(error: unknown, status: number) {
  return (error as { detail?: string } | undefined)?.detail ?? `요청에 실패했어요 (${status})`;
}

export function useSaveEnvironment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: EnvironmentRequest) => {
      const { data, error, response } = await api.PUT("/api/care-info/environment", { body });
      if (!data) throw new Error(errorMessage(error, response.status));
      return data;
    },
    onSuccess: (data) => queryClient.setQueryData(KEY, data),
  });
}

export function useAddAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (target: string) => {
      const { data, error, response } = await api.POST("/api/care-info/alerts", { body: { target } });
      if (!data) throw new Error(errorMessage(error, response.status));
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { error, response } = await api.DELETE("/api/care-info/alerts/{id}", { params: { path: { id } } });
      if (response.status !== 204) throw new Error(errorMessage(error, response.status));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}
