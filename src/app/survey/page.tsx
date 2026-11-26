import type { Metadata } from "next";
import { AppShell } from "@/components/app/app-shell";
import { TopBar } from "@/components/app/top-bar";
import { SurveyFlow } from "./survey-flow";

export const metadata: Metadata = { title: "피부 유형 진단 · OPP" };

export default function SurveyPage() {
  return (
    <AppShell>
      <TopBar title="피부 유형 진단" />
      <SurveyFlow />
    </AppShell>
  );
}
