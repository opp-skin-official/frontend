"use client";

import { useSearchParams } from "next/navigation";

/** 백엔드가 로그인 실패 시 /login?error 로 돌려보낸다. */
export function LoginError() {
  const params = useSearchParams();
  if (!params.has("error")) return null;
  return (
    <p role="alert" className="type-body text-destructive">
      로그인하지 못했어요. 다시 시도해 주세요.
    </p>
  );
}
