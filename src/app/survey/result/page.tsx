import type { Metadata } from "next";
import { AppShell } from "@/components/app/app-shell";
import { BottomTabBar } from "@/components/app/bottom-tab-bar";
import { TopBar } from "@/components/app/top-bar";
import { SurveyResult } from "./survey-result";

export const metadata: Metadata = { title: "피부 유형 결과 · 제대로" };

export default function SurveyResultPage() {
  return (
    <AppShell>
      <TopBar title="피부 유형 결과" />
      <SurveyResult />
      <BottomTabBar />
    </AppShell>
  );
}
