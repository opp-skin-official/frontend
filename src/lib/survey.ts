"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";

export type SurveyView = components["schemas"]["SurveyView"];
export type QuestionView = components["schemas"]["QuestionView"];
export type AssessmentView = components["schemas"]["AssessmentView"];
export type Axis = NonNullable<QuestionView["axis"]>;

export const AXES: { axis: Axis; title: string; front: string; back: string }[] = [
  { axis: "OIL", title: "유분", front: "지성", back: "건성" },
  { axis: "SENSITIVITY", title: "민감도", front: "민감", back: "저항" },
  { axis: "PIGMENTATION", title: "색소", front: "색소 경향", back: "비색소" },
  { axis: "WT", title: "노화 요인", front: "위험 요인 많음", back: "위험 요인 적음" },
  { axis: "CARE_STYLE", title: "관리 성향", front: "집중형", back: "간편형" },
];

/** enabled: 로그인 확인 뒤에만 호출한다(비로그인 시 401 반복 방지). */
export function useSurvey(enabled: boolean) {
  return useQuery({
    queryKey: ["skin-survey"],
    enabled,
    queryFn: async () => {
      const { data, response } = await api.GET("/api/skin-survey");
      if (!data) throw new Error(`survey failed: ${response.status}`);
      return data;
    },
  });
}

export function useLatestAssessment(enabled: boolean) {
  return useQuery({
    queryKey: ["skin-survey", "latest"],
    enabled,
    queryFn: async () => {
      const { data, response } = await api.GET("/api/skin-survey/assessments/latest");
      if (response.status === 404) return null;
      if (!data) throw new Error(`latest failed: ${response.status}`);
      return data;
    },
    retry: false,
  });
}

export function useSubmitAssessment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: { version: number; sensitiveConsent: boolean; answers: Record<number, number> }) => {
      const { data, error, response } = await api.POST("/api/skin-survey/assessments", { body });
      if (!data) {
        const message = (error as { detail?: string } | undefined)?.detail;
        throw new Error(message ?? `submit failed: ${response.status}`);
      }
      return data;
    },
    onSuccess: (data) => queryClient.setQueryData(["skin-survey", "latest"], data),
  });
}
