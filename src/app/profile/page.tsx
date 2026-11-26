import type { Metadata } from "next";
import { AppShell } from "@/components/app/app-shell";
import { BottomTabBar } from "@/components/app/bottom-tab-bar";
import { TopBar } from "@/components/app/top-bar";
import { ProfileView } from "./profile-view";

export const metadata: Metadata = { title: "피부 프로필 · OPP" };

export default function ProfilePage() {
  return (
    <AppShell>
      <TopBar title="피부 프로필" />
      <ProfileView />
      <BottomTabBar />
    </AppShell>
  );
}
