import type { Metadata } from "next";
import { AppShell } from "@/components/app/app-shell";
import { BottomTabBar } from "@/components/app/bottom-tab-bar";
import { TopBar } from "@/components/app/top-bar";
import { RoutineView } from "./routine-view";

export const metadata: Metadata = { title: "루틴 · OPP" };

export default function RoutinePage() {
  return (
    <AppShell>
      <TopBar title="루틴" />
      <RoutineView />
      <BottomTabBar />
    </AppShell>
  );
}
