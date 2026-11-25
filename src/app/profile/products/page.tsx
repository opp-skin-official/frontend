import type { Metadata } from "next";
import { AppShell } from "@/components/app/app-shell";
import { TopBar } from "@/components/app/top-bar";
import { MyProductsView } from "./my-products-view";

export const metadata: Metadata = { title: "내 보유제품 · 제대로" };

export default function MyProductsPage() {
  return (
    <AppShell>
      <TopBar title="내 보유제품" />
      <MyProductsView />
    </AppShell>
  );
}
