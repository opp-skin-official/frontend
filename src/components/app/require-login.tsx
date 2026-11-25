"use client";

import Link from "next/link";
import { useMe } from "@/lib/auth";

type Me = NonNullable<ReturnType<typeof useMe>["data"]>;

/** 로그인한 사용자에게만 children을 보여 준다. */
export function RequireLogin({
  message,
  children,
}: {
  message: string;
  children: (me: Me) => React.ReactNode;
}) {
  const me = useMe();
  if (me.isPending) return <p className="px-4 py-8 type-body text-muted-foreground">불러오는 중…</p>;
  if (me.isError) return <p className="px-4 py-8 type-body text-destructive">사용자 정보를 불러오지 못했어요.</p>;
  if (!me.data) {
    return (
      <p className="px-4 py-8 type-body text-muted-foreground">
        {message} <Link href="/login" className="underline">로그인하러 가기</Link>
      </p>
    );
  }
  return <>{children(me.data)}</>;
}
