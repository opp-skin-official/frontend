"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";

export type ProductSummary = components["schemas"]["ProductSummary"];
export type ProductDetail = components["schemas"]["ProductDetail"];
export type Category = NonNullable<ProductSummary["category"]>;
export type SkinFit = NonNullable<ProductDetail["skinFits"]>[number];
export type MyProductKind = components["schemas"]["MyProductRequest"]["kind"];
export type PriceRange = "UNDER_10K" | "FROM_10K_TO_20K" | "FROM_20K_TO_30K" | "OVER_30K";
export type Sort = "RECOMMENDED" | "PRICE_ASC" | "PRICE_DESC";

// 문구는 Figma "4-1제품추천" 탭·필터 그대로
export const TABS: { label: string; categories: Category[] }[] = [
  { label: "전체", categories: [] },
  { label: "클렌저", categories: ["CLEANSER"] },
  { label: "스킨케어", categories: ["TONER", "LOTION", "ESSENCE", "SUNSCREEN"] },
  { label: "크림", categories: ["CREAM"] },
];

export const CATEGORY_OPTIONS: { value: Category; label: string }[] = [
  { value: "CLEANSER", label: "클렌저" },
  { value: "TONER", label: "토너" },
  { value: "LOTION", label: "로션" },
  { value: "CREAM", label: "크림" },
  { value: "SUNSCREEN", label: "선크림" },
];

export const SKIN_OPTIONS: { value: SkinFit; label: string }[] = [
  { value: "OILY", label: "지성" },
  { value: "DRY", label: "건성" },
  { value: "COMBINATION", label: "복합성" },
  { value: "SENSITIVE", label: "민감성" },
];

export const PRICE_OPTIONS: { value: PriceRange; label: string }[] = [
  { value: "UNDER_10K", label: "1만원 이하" },
  { value: "FROM_10K_TO_20K", label: "1-2만원" },
  { value: "FROM_20K_TO_30K", label: "2-3만원" },
  { value: "OVER_30K", label: "3만원이상" },
];

export const SORT_OPTIONS: { value: Sort; label: string }[] = [
  { value: "RECOMMENDED", label: "추천순" },
  { value: "PRICE_ASC", label: "가격 낮은순" },
  { value: "PRICE_DESC", label: "가격 높은순" },
];

export const won = (price: number | undefined) => `${(price ?? 0).toLocaleString("ko-KR")}원`;

export type ProductFilters = {
  categories: Category[];
  q: string;
  skins: SkinFit[];
  prices: PriceRange[];
  sort: Sort;
};

export function useProducts(filters: ProductFilters, enabled: boolean) {
  return useInfiniteQuery({
    queryKey: ["products", filters],
    enabled,
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const { data, response } = await api.GET("/api/products", {
        params: {
          query: {
            category: filters.categories,
            q: filters.q,
            skin: filters.skins,
            price: filters.prices,
            sort: filters.sort,
            page: pageParam,
          },
        },
      });
      if (!data) throw new Error(`products failed: ${response.status}`);
      return data;
    },
    getNextPageParam: (last) => (last.hasNext ? (last.page ?? 0) + 1 : undefined),
  });
}

export function useProductDetail(id: number, enabled: boolean) {
  return useQuery({
    queryKey: ["product", id],
    enabled,
    queryFn: async () => {
      const { data, response } = await api.GET("/api/products/{id}", { params: { path: { id } } });
      if (response.status === 404) return null;
      if (!data) throw new Error(`product failed: ${response.status}`);
      return data;
    },
  });
}

export function useMyProducts(kind: MyProductKind | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ["my-products", kind ?? "ALL"],
    enabled,
    queryFn: async () => {
      const { data, response } = await api.GET("/api/my-products", { params: { query: { kind } } });
      if (!data) throw new Error(`my-products failed: ${response.status}`);
      return data;
    },
  });
}

/** 관심(하트)·보유 등록과 해제 */
export function useToggleMyProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, kind, on }: { productId: number; kind: MyProductKind; on: boolean }) => {
      const { response } = on
        ? await api.POST("/api/my-products", { body: { productId, kind } })
        : await api.DELETE("/api/my-products/{productId}", { params: { path: { productId }, query: { kind } } });
      if (response.status !== 204) throw new Error(`요청에 실패했어요 (${response.status})`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product"] });
      queryClient.invalidateQueries({ queryKey: ["my-products"] });
    },
  });
}
