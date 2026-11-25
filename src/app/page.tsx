import { ServerStatus } from "./server-status";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col gap-4 px-5 py-10">
      <h1 className="text-2xl font-semibold">제대로</h1>
      <ServerStatus />
    </main>
  );
}
