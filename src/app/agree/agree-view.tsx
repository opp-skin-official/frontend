"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAgreeTerms, useLogout, useMe } from "@/lib/auth";
import { TERMS_VERSION } from "@/lib/terms";

const ITEMS = [
  { key: "terms", label: "[필수] 서비스 이용약관", href: "/terms" },
  { key: "privacy", label: "[필수] 개인정보 수집·이용", href: "/privacy" },
] as const;

type Key = (typeof ITEMS)[number]["key"];

/** 처음 로그인했거나 약관이 바뀐 사용자에게 필수 약관 동의를 받는다. */
export function AgreeView() {
  const router = useRouter();
  const me = useMe();
  const agree = useAgreeTerms();
  const logout = useLogout();
  const [checked, setChecked] = useState<Record<Key, boolean>>({ terms: false, privacy: false });
  const all = ITEMS.every((i) => checked[i.key]);
  const alreadyAgreed = Boolean(me.data?.termsAgreed);

  useEffect(() => {
    if (alreadyAgreed) router.replace("/");
  }, [alreadyAgreed, router]);

  if (me.data === null) {
    return (
      <p className="px-4 py-8 type-body text-muted-foreground">
        로그인이 필요해요. <Link href="/login" className="underline">로그인하러 가기</Link>
      </p>
    );
  }
  if (alreadyAgreed) return null;

  return (
    <main className="flex flex-1 flex-col justify-between gap-6 px-4 pt-16 pb-8">
      <div className="flex flex-col gap-4">
        <h1 className="type-title">
          OPP를 시작하기 전에
          <br />
          약관에 동의해 주세요
        </h1>
        <p className="type-body text-muted-foreground">
          피부 상태와 상담 내용을 바탕으로 관리 방법을 안내하기 위해 아래 동의가 필요해요.
        </p>
        <label className="flex items-center gap-3 rounded-panel border border-border bg-secondary p-4">
          <input
            type="checkbox"
            checked={all}
            onChange={(e) => setChecked({ terms: e.target.checked, privacy: e.target.checked })}
            className="size-5 accent-[var(--brand-strong)]"
          />
          <span className="type-body-strong">모두 동의해요</span>
        </label>
        <ul className="flex flex-col gap-1 px-1">
          {ITEMS.map((item) => (
            <li key={item.key} className="flex items-center justify-between gap-3 py-2">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={checked[item.key]}
                  onChange={(e) => setChecked((c) => ({ ...c, [item.key]: e.target.checked }))}
                  className="size-5 accent-[var(--brand-strong)]"
                />
                <span className="type-body">{item.label}</span>
              </label>
              <Link href={item.href} className="type-caption text-muted-foreground underline">
                보기
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col gap-3">
        {agree.isError && <p className="type-caption text-destructive">{agree.error.message}</p>}
        <Button
          size="cta"
          disabled={!all || agree.isPending}
          onClick={() => agree.mutate(TERMS_VERSION, { onSuccess: () => router.replace("/") })}
        >
          {agree.isPending ? "저장하는 중…" : "동의하고 시작하기"}
        </Button>
        <button
          type="button"
          className="self-center type-caption text-muted-foreground underline"
          disabled={logout.isPending}
          onClick={() => logout.mutate(undefined, { onSuccess: () => router.replace("/login") })}
        >
          동의하지 않고 로그아웃
        </button>
      </div>
    </main>
  );
}
