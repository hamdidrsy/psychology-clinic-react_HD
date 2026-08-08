import { AdminArticleForm } from "@/components/admin-article-form";
import { requireContentManager } from "@/server/auth/session";

export default async function NewArticlePage() {
  await requireContentManager();
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <p className="eyebrow">Makaleler</p>
      <h1 className="mb-8 text-3xl font-bold">Yeni makale</h1>
      <section className="border-border rounded-2xl border bg-white p-6 shadow-sm">
        <AdminArticleForm />
      </section>
    </main>
  );
}
