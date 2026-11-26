import type { Metadata } from "next";
import { Suspense } from "react";
import { AppShell } from "@/components/app/app-shell";
import { KakaoLoginButton } from "./kakao-login-button";
import { LoginError } from "./login-error";

export const metadata: Metadata = { title: "로그인 · OPP" };

export default function LoginPage() {
  return (
    <AppShell className="justify-between px-4 pt-32 pb-12">
      <div className="flex flex-col gap-3">
        <h1 className="type-title">OPP</h1>
        <p className="type-body text-muted-foreground">
          AI 비서와 함께 지금 할 수 있는
          <br />
          피부 관리를 찾아요.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <Suspense>
          <LoginError />
        </Suspense>
        <KakaoLoginButton />
      </div>
    </AppShell>
  );
}
