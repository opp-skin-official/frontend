import type { Metadata } from "next";
import { AppShell } from "@/components/app/app-shell";
import { TopBar } from "@/components/app/top-bar";
import { ConsultReport } from "../report-view";

export const metadata: Metadata = { title: "관리 리포트 · OPP" };

/** R-01 관리 리포트. 상담 번호는 ConsultReport가 주소에서 읽는다. */
export default function ConsultReportPage() {
  return (
    <AppShell>
      <TopBar title="관리 리포트" />
      <ConsultReport />
    </AppShell>
  );
}
