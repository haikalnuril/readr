import { TopBar } from "@/components/TopBar";
import { FileUploader } from "@/components/FileUploader";
import { HistoryList } from "@/components/HistoryList";

export default function HomePage() {
  return (
    <div className="min-h-dvh">
      <TopBar />
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-6">
        <section>
          <FileUploader />
        </section>
        <section>
          <HistoryList />
        </section>
      </main>
    </div>
  );
}
