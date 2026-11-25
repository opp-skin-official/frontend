import type { Metadata } from "next";
import { AppShell } from "@/components/app/app-shell";
import { TopBar } from "@/components/app/top-bar";
import { ProgressView } from "./progress-view";

export const metadata: Metadata = { title: "관리 경과 · 제대로" };

export default function ProgressPage() {
  return (
    <AppShell>
      <TopBar title="관리 경과" />
      <ProgressView />
    </AppShell>
  );
}
