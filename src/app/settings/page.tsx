import type { Metadata } from "next";
import { AppShell } from "@/components/app/app-shell";
import { BottomTabBar } from "@/components/app/bottom-tab-bar";
import { TopBar } from "@/components/app/top-bar";
import { SettingsView } from "./settings-view";

export const metadata: Metadata = { title: "설정 · OPP" };

export default function SettingsPage() {
  return (
    <AppShell>
      <TopBar title="설정" />
      <SettingsView />
      <BottomTabBar />
    </AppShell>
  );
}
