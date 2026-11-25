import type { Metadata } from "next";
import { AppShell } from "@/components/app/app-shell";
import { BottomTabBar } from "@/components/app/bottom-tab-bar";
import { TopBar } from "@/components/app/top-bar";
import { ProductsView } from "./products-view";

export const metadata: Metadata = { title: "제품 추천 · 제대로" };

export default function ProductsPage() {
  return (
    <AppShell>
      <TopBar title="제품 추천" />
      <ProductsView />
      <BottomTabBar />
    </AppShell>
  );
}
