import type { Metadata } from "next";

import { ArticleCard } from "@/components/article-card";
import { ContentNotice } from "@/components/content-notice";
import { PageHeader } from "@/components/page-header";
import { Container } from "@/components/ui/container";
import { articles } from "@/lib/content";

export const metadata: Metadata = {
  title: "Makaleler",
  description:
    "Psikolojik destek ve görüşme süreci hakkında genel bilgilendirme amaçlı taslak makaleler.",
};

export default function ArticlesPage() {
  const categories = [...new Set(articles.map((article) => article.category))];
  return (
    <main>
      <PageHeader
        eyebrow="Makaleler"
        title="Süreci daha anlaşılır kılan okumalar"
        lead="Makaleler genel bilgilendirme amaçlıdır; kişiye özel değerlendirme, tanı veya tedavi önerisi yerine geçmez."
      />
      <Container className="py-10">
        <ContentNotice />
        <div
          aria-label="Makale kategorileri"
          className="mt-8 flex flex-wrap gap-2"
        >
          <span className="bg-primary rounded-full px-4 py-2 text-sm font-bold text-white">
            Tümü
          </span>
          {categories.map((category) => (
            <span
              className="border-border rounded-full border bg-white px-4 py-2 text-sm font-bold"
              key={category}
            >
              {category}
            </span>
          ))}
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard article={article} key={article.slug} />
          ))}
        </div>
        <p className="text-ink-muted mt-10 text-sm leading-6">
          İlk içerik sayısı az olduğu için arama ve sayfalama gösterilmiyor.
          İçerik hacmi arttığında server-side filtreleme ve sayfalama
          eklenecektir.
        </p>
      </Container>
    </main>
  );
}
