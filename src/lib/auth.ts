"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL, api, readXsrfToken } from "@/lib/api/client";

/** 카카오 로그인 시작 주소. 백엔드가 카카오로 보내고, 끝나면 프론트 홈으로 돌려보낸다. */
export const KAKAO_LOGIN_URL = `${API_BASE_URL}/oauth2/authorization/kakao`;

/** 로그인한 사용자. 로그인 전이면 null. */
export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data, response } = await api.GET("/api/me");
      if (response.status === 401) return null;
      if (!data) throw new Error(`me failed: ${response.status}`);
      return data;
    },
    retry: false,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      // /api/logout은 Spring Security 필터가 처리해 OpenAPI 명세에 없으므로 fetch를 직접 쓴다.
      const token = readXsrfToken();
      const response = await fetch(`${API_BASE_URL}/api/logout`, {
        method: "POST",
        credentials: "include",
        headers: token ? { "X-XSRF-TOKEN": token } : {},
      });
      if (response.status !== 204) throw new Error(`logout failed: ${response.status}`);
    },
    onSuccess: () => queryClient.setQueryData(["me"], null),
  });
}

/** 회원 탈퇴: 서버가 모든 기록을 지우고 로그아웃시킨다(되돌릴 수 없음). 성공하면 화면에 남은 데이터도 비운다. */
export function useDeleteAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { response } = await api.DELETE("/api/me");
      if (response.status !== 204) throw new Error("탈퇴하지 못했어요. 잠시 후 다시 시도해 주세요.");
    },
    onSuccess: () => {
      queryClient.clear();
      queryClient.setQueryData(["me"], null);
    },
  });
}

/** 필수 약관(이용약관, 개인정보 수집·이용)에 동의한다. version은 화면에 보여 준 약관 버전. */
export function useAgreeTerms() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (version: string) => {
      const { error, response } = await api.POST("/api/me/terms", { body: { version } });
      if (response.status !== 204) {
        throw new Error((error as { detail?: string } | undefined)?.detail ?? "동의를 저장하지 못했어요. 잠시 후 다시 시도해 주세요.");
      }
    },
    onSuccess: () => queryClient.invalidateQueries(),
  });
}
