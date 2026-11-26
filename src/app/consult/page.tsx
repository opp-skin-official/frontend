import type { Metadata } from "next";
import { AppShell } from "@/components/app/app-shell";
import { TopBar } from "@/components/app/top-bar";
import { ConsultIntake } from "./consult-intake";

export const metadata: Metadata = { title: "AI 피부 상담 · OPP" };

/** C-01 문진 → C-02 상담 내용 확인. 확인하면 리포트(/consult/{id})로 간다. */
export default function ConsultPage() {
  return (
    <AppShell>
      <TopBar title="AI 비서" />
      <ConsultIntake />
    </AppShell>
  );
}
