import type { Metadata } from "next";
import { AppShell } from "@/components/app/app-shell";
import { TopBar } from "@/components/app/top-bar";
import { PlanForm } from "./plan-form";

export const metadata: Metadata = { title: "목표일 설정 · OPP" };

export default function PlanPage() {
  return (
    <AppShell>
      <TopBar title="목표일 설정" />
      <PlanForm />
    </AppShell>
  );
}
