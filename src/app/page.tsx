import { AppShell } from "@/components/app/app-shell";
import { BottomTabBar } from "@/components/app/bottom-tab-bar";
import { HomeView } from "./home-view";

export default function Home() {
  return (
    <AppShell>
      <HomeView />
      <BottomTabBar />
    </AppShell>
  );
}
