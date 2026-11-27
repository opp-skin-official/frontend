"use client";

import { api } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";

/** AI가 만든 답변·리포트 신고 (Google Play 생성형 AI 정책: 앱 안에서 신고할 수 있어야 한다) */
export type ReportRequest = components["schemas"]["ReportRequest"];
export type ReportReason = ReportRequest["reason"];

export const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: "OFFENSIVE", label: "불쾌하거나 부적절해요" },
  { value: "HARMFUL", label: "위험한 내용이에요" },
  { value: "MEDICAL", label: "진단·처방처럼 말해요" },
  { value: "INACCURATE", label: "사실과 달라요" },
  { value: "OTHER", label: "기타" },
];

export const REPORT_DETAIL_MAX = 500;

function failure(error: unknown, status: number) {
  const detail = (error as { detail?: string } | undefined)?.detail;
  return new Error(detail ?? `신고를 보내지 못했어요. 잠시 후 다시 시도해 주세요. (${status})`);
}

/** 채팅 답변 하나를 신고한다. */
export async function reportChatAnswer(conversationId: number, messageId: number, body: ReportRequest) {
  const { error, response } = await api.POST("/api/conversations/{id}/messages/{messageId}/reports", {
    params: { path: { id: conversationId, messageId } },
    body,
  });
  if (!response.ok) throw failure(error, response.status);
}

/** 상담 관리 리포트를 신고한다 (id = 상담 id). */
export async function reportConsultation(id: number, body: ReportRequest) {
  const { error, response } = await api.POST("/api/consultations/{id}/reports", { params: { path: { id } }, body });
  if (!response.ok) throw failure(error, response.status);
}
