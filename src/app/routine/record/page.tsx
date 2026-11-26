import type { Metadata } from "next";
import { AppShell } from "@/components/app/app-shell";
import { TopBar } from "@/components/app/top-bar";
import { RecordForm } from "./record-form";

export const metadata: Metadata = { title: "경과 기록 · OPP" };

export default function RecordPage() {
  return (
    <AppShell>
      <TopBar title="경과 기록" />
      <RecordForm />
    </AppShell>
  );
}
