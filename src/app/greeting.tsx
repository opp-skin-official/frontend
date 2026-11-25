"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLogout, useMe } from "@/lib/auth";

export function Greeting() {
  const { data: me, isPending, isError } = useMe();
  const logout = useLogout();

  if (isPending) return <p className="type-body text-muted-foreground">불러오는 중…</p>;
  if (isError) return <p className="type-body text-destructive">사용자 정보를 불러오지 못했어요.</p>;
  if (!me) {
    return (
      <div className="flex flex-col gap-3">
        <p className="type-section">로그인이 필요해요</p>
        <Link href="/login" className="type-body underline">
          로그인하러 가기
        </Link>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      <p className="type-section" data-testid="greeting">
        안녕하세요, {me.nickname ?? "사용자"}님
      </p>
      <Button variant="secondary" size="cta" onClick={() => logout.mutate()} disabled={logout.isPending}>
        로그아웃
      </Button>
    </div>
  );
}
