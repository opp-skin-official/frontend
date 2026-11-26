"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useMe } from "@/lib/auth";
import { TERMS_FREE_PATHS } from "@/lib/terms";

/** 로그인했지만 필수 약관에 동의하지 않은 사용자는 동의 화면(/agree)으로 보낸다. 서버도 동의 전 API를 막는다. */
export function TermsGate({ children }: { children: React.ReactNode }) {
  const me = useMe();
  const pathname = usePathname();
  const router = useRouter();
  const blocked = Boolean(me.data && !me.data.termsAgreed && !TERMS_FREE_PATHS.includes(pathname));

  useEffect(() => {
    if (blocked) router.replace("/agree");
  }, [blocked, router]);

  return blocked ? null : <>{children}</>;
}
