import type { Metadata } from "next";
import { AppShell } from "@/components/app/app-shell";
import { TopBar } from "@/components/app/top-bar";
import { CareInfoView } from "./care-info-view";

export const metadata: Metadata = { title: "CARE INFO · OPP" };

export default function CareInfoPage() {
  return (
    <AppShell>
      <TopBar title="CARE INFO" />
      <CareInfoView />
    </AppShell>
  );
}
