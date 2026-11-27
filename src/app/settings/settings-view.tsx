"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { RequireLogin } from "@/components/app/require-login";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useDeleteAccount, useLogout } from "@/lib/auth";
import { useMorph } from "@/lib/morph";

/** Figma "5 설정"(175:2964) 중 지금 동작하는 항목만: 계정, 내 피부 프로필, 서비스 이용 안내, 로그아웃, 회원 탈퇴 */
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
          <DeleteAccount onDeleted={() => router.replace("/login")} />
        </main>
      )}
    </RequireLogin>
  );
}

/** 회원 탈퇴: 한 번 더 확인한 뒤 지운다. */
function DeleteAccount({ onDeleted }: { onDeleted: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const { panelRef, mounted, capture } = useMorph<HTMLElement>(confirming);
  const deletion = useDeleteAccount();

  // 버튼이 확인 카드로 부풀고, 취소하면 다시 버튼으로 줄어든다.
  if (!mounted) {
    return (
      <button
        type="button"
        className="self-center type-caption text-muted-foreground underline"
        onClick={(e) => {
          capture(e.currentTarget);
          setConfirming(true);
        }}
      >
        회원 탈퇴
      </button>
    );
  }
  return (
    <section
      ref={panelRef}
      role="alertdialog"
      aria-labelledby="delete-account-title"
      className="flex flex-col gap-3 rounded-panel border border-border bg-surface px-[22px] py-5"
    >
      <p data-morph-item id="delete-account-title" className="type-body-strong">정말 탈퇴할까요?</p>
      <p data-morph-item className="type-caption text-muted-foreground">
        피부 유형 설문, 상담·리포트, AI 채팅, 루틴·경과 기록, 내 제품·리뷰, 주의 성분이 바로 모두 지워지고 되돌릴 수 없어요.
      </p>
      {deletion.isError && <p className="type-caption text-destructive">{deletion.error.message}</p>}
      <div data-morph-item className="grid grid-cols-2 gap-2">
        <Button variant="secondary" disabled={deletion.isPending} onClick={() => setConfirming(false)}>
          취소
        </Button>
        <Button
          variant="destructive"
          disabled={deletion.isPending}
          onClick={() => deletion.mutate(undefined, { onSuccess: onDeleted })}
        >
          {deletion.isPending ? "탈퇴하는 중…" : "탈퇴하기"}
        </Button>
      </div>
    </section>
  );
}
