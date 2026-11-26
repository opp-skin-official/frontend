"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";

export type ConsultRequest = components["schemas"]["ConsultRequest"];
export type ConsultView = components["schemas"]["ConsultView"];
export type ReportView = components["schemas"]["ReportView"];
export type RoutineView = components["schemas"]["RoutineView"];

export type ConcernKind = ConsultRequest["kind"];
export type Region = NonNullable<ConsultRequest["regions"]>[number];
export type Onset = ConsultRequest["onset"];
export type Duration = ConsultRequest["duration"];
export type Change = ConsultRequest["change"];
export type Activity = NonNullable<ConsultRequest["activities"]>[number];
export type CareTime = NonNullable<ConsultRequest["careTime"]>;
export type Product = NonNullable<ConsultRequest["products"]>[number];

type Option<T> = { value: T; label: string };

// 문진 선택지. 값은 Model A 명세(AI API v4.2)와 1:1로 맞는다. 진단명 대신 보이는 증상으로 적는다.
export const KIND_OPTIONS: Option<ConcernKind>[] = [
  { value: "ACNE_COMEDONAL_INFLAMMATORY", label: "여드름·뾰루지" },
  { value: "FOLLICULITIS_SHAVING", label: "면도 후 붉어짐·따가움" },
  { value: "DRYNESS_BARRIER_DAMAGE", label: "건조·당김" },
  { value: "CONTACT_IRRITANT_DERMATITIS", label: "제품·위장크림 후 자극" },
  { value: "SEBORRHEIC_DERMATITIS", label: "번들거림과 각질" },
  { value: "ATOPIC_DERMATITIS", label: "가렵고 건조한 붉은 부위" },
  { value: "POST_ACNE_SCAR_ERYTHEMA_PORES", label: "트러블 자국·모공" },
  { value: "UV_PIGMENTATION_PHOTOAGING", label: "햇빛 후 잡티·기미" },
  { value: "SKIN_IMPROVEMENT_MAINTENANCE", label: "전반적인 피부 관리" },
];

export const REGION_OPTIONS: Option<Region>[] = [
  { value: "FOREHEAD", label: "이마" },
  { value: "CHEEK_LEFT", label: "왼쪽 볼" },
  { value: "CHEEK_RIGHT", label: "오른쪽 볼" },
  { value: "NOSE", label: "코" },
  { value: "CHIN", label: "턱" },
  { value: "EYE_AREA", label: "눈가" },
];

export const ONSET_OPTIONS: Option<Onset>[] = [
  { value: "IMMEDIATE_ACUTE", label: "오늘 갑자기" },
  { value: "POST_PRODUCT_SHAVE", label: "면도·제품 사용 뒤" },
  { value: "TRAINING_FIELD", label: "야외훈련 뒤" },
  { value: "DURING_SERVICE", label: "군 생활 중 서서히" },
  { value: "CHRONIC_PRE_ENLISTMENT", label: "입대 전부터" },
  { value: "OTHER_UNSPECIFIED", label: "잘 모르겠어요" },
];

export const DURATION_OPTIONS: Option<Duration>[] = [
  { value: "ACUTE_DAYS", label: "며칠" },
  { value: "WEEKS", label: "몇 주" },
  { value: "MONTHS", label: "몇 달" },
  { value: "SERVICE_ONGOING", label: "복무 내내" },
  { value: "CHRONIC_YEARS", label: "몇 년째" },
];

export const SEVERITY_OPTIONS: Option<number>[] = [
  { value: 1, label: "1 거의 괜찮아요" },
  { value: 2, label: "2 조금 신경 쓰여요" },
  { value: 3, label: "3 불편해요" },
  { value: 4, label: "4 많이 불편해요" },
  { value: 5, label: "5 참기 힘들어요" },
];

export const CHANGE_OPTIONS: Option<Change>[] = [
  { value: "WORSENED", label: "점점 심해져요" },
  { value: "UNCHANGED", label: "처음이랑 비슷해요" },
  { value: "IMPROVED", label: "조금 나아지고 있어요" },
];

export const ACTIVITY_OPTIONS: Option<Activity>[] = [
  { value: "OUTDOOR_TRAINING", label: "야외훈련" },
  { value: "MARCH", label: "행군" },
  { value: "GAS_MASK", label: "방독면 착용" },
  { value: "CAMO_CREAM", label: "위장크림" },
  { value: "HELMET_STRAP", label: "헬멧 턱끈" },
  { value: "SHAVING", label: "면도" },
];

export const CARE_TIME_OPTIONS: Option<CareTime>[] = [
  { value: "MORNING_EVENING", label: "아침·저녁 모두 가능" },
  { value: "EVENING_ONLY", label: "저녁부터 세안 가능" },
  { value: "MINIMAL", label: "2분 정도만 가능" },
];

export const PRODUCT_OPTIONS: Option<Product>[] = [
  { value: "CLEANSER", label: "세안제" },
  { value: "MOISTURIZER", label: "보습제" },
  { value: "SUNSCREEN", label: "선크림" },
  { value: "ALL_IN_ONE", label: "올인원" },
];

export const TARGET_OPTIONS: Option<number>[] = [
  { value: 0, label: "정해진 날 없어요" },
  { value: 7, label: "1주 안에" },
  { value: 14, label: "2주 안에" },
  { value: 30, label: "한 달 안에" },
];

export function labelOf<T>(options: Option<T>[], value: T | undefined | null) {
  return options.find((o) => o.value === value)?.label ?? "";
}

export function labelsOf<T>(options: Option<T>[], values: T[] | undefined | null) {
  // 선택지 순서대로 보여 준다.
  return options.filter((o) => values?.includes(o.value)).map((o) => o.label);
}

function detail(error: unknown, fallback: string) {
  return (error as { detail?: string } | undefined)?.detail ?? fallback;
}

export function useConsultation(id: number) {
  return useQuery({
    queryKey: ["consultation", id],
    queryFn: async () => {
      const { data, error, response } = await api.GET("/api/consultations/{id}", { params: { path: { id } } });
      if (!data) throw new Error(response.status === 404 ? "상담을 찾을 수 없어요." : detail(error, "상담을 불러오지 못했어요."));
      return data;
    },
    retry: (count, error) => error.message !== "상담을 찾을 수 없어요." && count < 2,
  });
}

/** 문진 확정 → 리포트 생성. AI 분석으로 수십 초 걸릴 수 있다. */
export function useCreateConsultation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: ConsultRequest) => {
      const { data, error } = await api.POST("/api/consultations", { body });
      if (!data) throw new Error(detail(error, "분석을 하지 못했어요. 잠시 후 다시 시도해 주세요."));
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["consultation", data.id], data);
      void queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useRegenerateRoutine(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await api.POST("/api/consultations/{id}/routine", { params: { path: { id } } });
      if (!data) throw new Error(detail(error, "루틴을 만들지 못했어요. 잠시 후 다시 시도해 주세요."));
      return data;
    },
    onSuccess: (data) => queryClient.setQueryData(["consultation", id], data),
  });
}

export function useApplyRoutine(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await api.POST("/api/consultations/{id}/apply", { params: { path: { id } } });
      if (!data) throw new Error(detail(error, "루틴을 시작하지 못했어요."));
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["consultation", id] });
      // 루틴 화면(["routine", ...])을 새 계획으로 다시 불러온다.
      void queryClient.invalidateQueries({ queryKey: ["routine"] });
    },
  });
}
