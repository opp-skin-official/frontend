"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { RequireLogin } from "@/components/app/require-login";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/lib/auth";

/** Figma "5 설정"(175:2964) 중 지금 동작하는 항목만: 계정, 내 피부 프로필, 서비스 이용 안내, 로그아웃 */
export function SettingsView() {
  const router = useRouter();
  const logout = useLogout();
  return (
    <RequireLogin message="설정을 보려면 로그인이 필요해요.">
      {(me) => (
        <main className="flex flex-1 flex-col gap-6 px-4 py-6">
          <section className="flex flex-col gap-1 rounded-panel border border-border bg-secondary px-[22px] py-5">
            <p className="type-body-strong">{me.nickname ?? "사용자"}</p>
            <p className="type-caption text-muted-foreground">카카오 계정으로 로그인</p>
          </section>
          <nav className="flex flex-col divide-y divide-border rounded-panel border border-border bg-surface">
            <Link href="/profile" className="px-[22px] py-4 type-body">내 피부 프로필</Link>
            <Link href="/profile/care-info" className="px-[22px] py-4 type-body">기타 정보 (CARE INFO)</Link>
          </nav>
          <section className="rounded-panel bg-secondary px-[22px] py-4 type-caption text-muted-foreground">
            서비스에서 제공하는 정보는 피부관리 참고용이며, 증상이 지속되면 의료진과 상담해 주세요.
          </section>
          <Button
            variant="secondary"
            size="cta"
            disabled={logout.isPending}
            onClick={() => logout.mutate(undefined, { onSuccess: () => router.push("/login") })}
          >
            로그아웃
          </Button>
        </main>
      )}
    </RequireLogin>
  );
}
