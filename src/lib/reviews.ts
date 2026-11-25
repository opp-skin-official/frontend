"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";

export type ReviewRequest = components["schemas"]["ReviewRequest"];
export type ReviewView = components["schemas"]["ReviewView"];
export type SkinOption = NonNullable<ReviewRequest["skinOption"]>;

// Figma "리뷰작성"의 구매 옵션
export const SKIN_OPTION_LABELS: { value: SkinOption; label: string }[] = [
  { value: "OILY", label: "지성용" },
  { value: "DRY", label: "건성용" },
  { value: "OILY_DRY", label: "수부지용" },
  { value: "SENSITIVE", label: "민감성용" },
  { value: "COMBINATION", label: "복합성용" },
];

export const skinOptionLabel = (v: SkinOption | undefined) => SKIN_OPTION_LABELS.find((o) => o.value === v)?.label;

/** "2일 전" 형식 */
export function timeAgo(iso: string | undefined) {
  if (!iso) return "";
  const days = Math.floor((Date.now() - Date.parse(iso)) / 86400000);
  if (days <= 0) return "오늘";
  if (days < 30) return `${days}일 전`;
  return new Date(iso).toLocaleDateString("ko-KR");
}

function errorMessage(error: unknown, status: number) {
  return (error as { detail?: string } | undefined)?.detail ?? `요청에 실패했어요 (${status})`;
}

export function useReviews(productId: number, enabled: boolean) {
  return useInfiniteQuery({
    queryKey: ["reviews", productId],
    enabled,
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const { data, response } = await api.GET("/api/products/{productId}/reviews", {
        params: { path: { productId }, query: { page: pageParam } },
      });
      if (!data) throw new Error(`reviews failed: ${response.status}`);
      return data;
    },
    getNextPageParam: (last) => (last.hasNext ? (last.page ?? 0) + 1 : undefined),
  });
}

export function useReviewForm(productId: number, enabled: boolean) {
  return useQuery({
    queryKey: ["review-form", productId],
    enabled,
    queryFn: async () => {
      const { data, response } = await api.GET("/api/products/{productId}/review-form", {
        params: { path: { productId } },
      });
      if (response.status === 404) return null;
      if (!data) throw new Error(`review form failed: ${response.status}`);
      return data;
    },
  });
}

export function useSaveReview(productId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: ReviewRequest) => {
      const { data, error, response } = await api.PUT("/api/products/{productId}/reviews/me", {
        params: { path: { productId } },
        body,
      });
      if (!data) throw new Error(errorMessage(error, response.status));
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
      queryClient.invalidateQueries({ queryKey: ["review-form", productId] });
    },
  });
}

export function useDeleteReview(productId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { error, response } = await api.DELETE("/api/products/{productId}/reviews/me", {
        params: { path: { productId } },
      });
      if (response.status !== 204) throw new Error(errorMessage(error, response.status));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
      queryClient.invalidateQueries({ queryKey: ["review-form", productId] });
    },
  });
}
