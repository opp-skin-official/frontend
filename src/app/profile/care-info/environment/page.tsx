import type { Metadata } from "next";
import { AppShell } from "@/components/app/app-shell";
import { TopBar } from "@/components/app/top-bar";
import { EnvironmentForm } from "./environment-form";

export const metadata: Metadata = { title: "생활 환경 · OPP" };

export default function EnvironmentPage() {
  return (
    <AppShell>
      <TopBar title="CARE INFO" />
      <EnvironmentForm />
    </AppShell>
  );
}
