import type { Metadata } from "next";
import { Suspense } from "react";
import { AppShell } from "@/components/app/app-shell";
import { TopBar } from "@/components/app/top-bar";
import { ReviewFormView } from "./review-form";

export const metadata: Metadata = { title: "리뷰 작성 · OPP" };

export default function ReviewPage() {
  return (
    <AppShell>
      <TopBar title="리뷰 작성" />
      <Suspense>
        <ReviewFormView />
      </Suspense>
    </AppShell>
  );
}
