import { ArticleCard } from "@/components/article-card";
import { ContentNotice } from "@/components/content-notice";
import { PageHeader } from "@/components/page-header";
import { Container } from "@/components/ui/container";
import { articles } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { getPublishedArticles } from "@/server/articles/public";

export const metadata = pageMetadata({
  title: "Makaleler",
  description:
    "Psikolojik destek ve görüşme süreci hakkında genel bilgilendirme amaçlı makaleler.",
  path: "/makaleler",
});

export default async function ArticlesPage() {
  const databaseArticles = await getPublishedArticles();
  const staticSlugs = new Set(articles.map((article) => article.slug));
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
          {databaseArticles
            .filter((article) => !staticSlugs.has(article.slug))
            .map((article) => (
              <article
                className="border-border rounded-2xl border bg-white p-6 shadow-sm"
                key={article.id}
              >
                <p className="eyebrow">{article.category?.name ?? "Makale"}</p>
                <h2 className="text-xl font-bold">
                  <Link
                    className="hover:text-primary"
                    href={`/makaleler/${article.slug}`}
                  >
                    {article.title}
                  </Link>
                </h2>
                <p className="text-ink-muted mt-3 leading-7">
                  {article.excerpt}
                </p>
              </article>
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
import Link from "next/link";
