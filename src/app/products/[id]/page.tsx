import type { Metadata } from "next";
import { Suspense } from "react";
import { AppShell } from "@/components/app/app-shell";
import { TopBar } from "@/components/app/top-bar";
import { ProductDetailView } from "./product-detail-view";

export const metadata: Metadata = { title: "제품 상세 · OPP" };

export default function ProductDetailPage() {
  return (
    <AppShell>
      <TopBar title="제품 상세" />
      <Suspense>
        <ProductDetailView />
      </Suspense>
    </AppShell>
  );
}
