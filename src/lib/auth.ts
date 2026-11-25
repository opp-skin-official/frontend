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
