"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

export function ServerStatus() {
  const { data, isPending, isError } = useQuery({
    queryKey: ["ping"],
    queryFn: async () => {
      const { data, error } = await api.GET("/api/ping");
      if (error || !data) throw new Error("ping failed");
      return data;
    },
    retry: false,
  });

  if (isPending) return <p data-testid="server-status">서버 확인 중…</p>;
  if (isError) return <p data-testid="server-status">서버 연결 실패</p>;
  return <p data-testid="server-status">서버 연결됨 ({data.status})</p>;
}
