import type { Metadata } from "next";
import { AppShell } from "@/components/app/app-shell";
import { AgreeView } from "./agree-view";

export const metadata: Metadata = { title: "서비스 이용 동의 · OPP" };

export default function AgreePage() {
  return (
    <AppShell>
      <AgreeView />
    </AppShell>
  );
}
