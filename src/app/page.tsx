import { AppShell } from "@/components/app/app-shell";
import { BottomTabBar } from "@/components/app/bottom-tab-bar";
import { Greeting } from "./greeting";
import { ServerStatus } from "./server-status";

export default function Home() {
  return (
    <AppShell>
      <main className="flex flex-1 flex-col gap-4 px-4 py-10">
        <Greeting />
        <ServerStatus />
      </main>
      <BottomTabBar />
    </AppShell>
  );
}
