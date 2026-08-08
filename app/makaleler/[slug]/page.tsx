import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { ContentNotice } from "@/components/content-notice";
import { JsonLd } from "@/components/json-ld";
import { MarkdownContent } from "@/components/markdown-content";
import { ShareButton } from "@/components/share-button";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { articles, getArticle, getService } from "@/lib/content";
import { formatDate } from "@/lib/format-date";
import { absoluteUrl, articleMetadata } from "@/lib/seo";
import {
  getPublishedArticleBySlug,
  getPublishedRedirect,
} from "@/server/articles/public";

type ArticlePageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return articles.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const slug = (await params).slug;
  const article = getArticle(slug);
  if (article) {
    return articleMetadata({
      title: article.title,
      description: article.excerpt,
      path: `/makaleler/${article.slug}`,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      author: "Hasan Durusoy",
    });
  }
  const databaseArticle = await getPublishedArticleBySlug(slug);
  if (!databaseArticle) {
    const redirectRecord = await getPublishedRedirect(slug);
    if (redirectRecord)
      return { title: "Makale yönlendiriliyor", robots: { index: false } };
    notFound();
  }
  const canonicalPath = databaseArticle.canonicalUrl ?? `/makaleler/${slug}`;
  return articleMetadata({
    title: databaseArticle.metaTitle ?? databaseArticle.title,
    description: databaseArticle.metaDescription ?? databaseArticle.excerpt,
    path: canonicalPath,
    publishedTime: databaseArticle.publishedAt?.toISOString(),
    modifiedTime: databaseArticle.updatedAt.toISOString(),
    author: databaseArticle.author.displayName,
    image:
      databaseArticle.socialImageUrl ??
      databaseArticle.coverImageUrl ??
      undefined,
  });
}

export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  const slug = (await params).slug;
  const article = getArticle(slug);
  if (!article) {
    const redirectRecord = await getPublishedRedirect(slug);
    if (redirectRecord)
      permanentRedirect(`/makaleler/${redirectRecord.article.slug}`);
    const databaseArticle = await getPublishedArticleBySlug(slug);
    if (!databaseArticle) notFound();
    return <DatabaseArticle article={databaseArticle} />;
  }
  const service = getService(article.relatedServiceSlug);

  return (
    <main>
      <article>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Article",
            headline: article.title,
            description: article.excerpt,
            datePublished: article.publishedAt,
            dateModified: article.updatedAt,
            mainEntityOfPage: absoluteUrl(`/makaleler/${article.slug}`),
            author: {
              "@type": "Person",
              name: "Hasan Durusoy",
              url: absoluteUrl("/hakkimda"),
            },
          }}
        />
        <header className="page-hero">
          <Container className="max-w-5xl">
            <Breadcrumbs
              items={[
                { label: "Ana sayfa", href: "/" },
                { label: "Makaleler", href: "/makaleler" },
                { label: article.title },
              ]}
            />
            <p className="eyebrow">{article.category}</p>
            <h1 className="page-title">{article.title}</h1>
            <p className="page-lead">{article.excerpt}</p>
            <div className="text-ink-muted mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm">
              <span>Yazar: Hasan Durusoy · doğrulama bekliyor</span>
              <span>
                Yayımlanma:{" "}
                <time dateTime={article.publishedAt}>
                  {formatDate(article.publishedAt)}
                </time>
              </span>
              <span>
                Güncellenme:{" "}
                <time dateTime={article.updatedAt}>
                  {formatDate(article.updatedAt)}
                </time>
              </span>
              <span>{article.readingTime}</span>
            </div>
          </Container>
        </header>
        <Container className="max-w-5xl py-10">
          <ContentNotice />
        </Container>
        <Container className="grid max-w-5xl gap-10 pb-20 lg:grid-cols-[minmax(0,1fr)_15rem]">
          <div className="prose-content min-w-0">
            <nav
              aria-label="Makale içindekiler"
              className="border-border mb-10 rounded-2xl border bg-white p-5"
            >
              <h2 className="mt-0 text-lg">Bu yazıda</h2>
              <ol className="mt-3 grid gap-2 text-sm">
                {article.paragraphs.map((section, index) => (
                  <li key={section.heading}>
                    <a href={`#bolum-${index + 1}`}>{section.heading}</a>
                  </li>
                ))}
              </ol>
            </nav>
            {article.paragraphs.map((section, index) => (
              <section
                aria-labelledby={`bolum-${index + 1}`}
                key={section.heading}
              >
                <h2 id={`bolum-${index + 1}`}>{section.heading}</h2>
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </section>
            ))}
            <section aria-labelledby="kaynaklar">
              <h2 id="kaynaklar">Kaynaklar ve editoryal not</h2>
              <p>
                Bu taslak metinlerin klinik kaynakları ve editoryal incelemesi
                yayın öncesinde eklenecektir. Kaynaksız sağlık iddiası
                production’da yayımlanmayacaktır.
              </p>
            </section>
          </div>
          <aside className="space-y-6 lg:pt-2">
            <ShareButton title={article.title} />
            {service && (
              <div className="border-border rounded-2xl border bg-white p-5">
                <p className="text-primary text-sm font-bold">İlgili hizmet</p>
                <h2 className="mt-2 text-lg font-bold">{service.title}</h2>
                <ButtonLink
                  className="mt-4"
                  href={`/hizmetler/${service.slug}`}
                  variant="quiet"
                >
                  Hizmeti incele
                </ButtonLink>
              </div>
            )}
            <Link
              className="text-link inline-block font-bold underline underline-offset-4"
              href="/makaleler"
            >
              Tüm makalelere dön
            </Link>
          </aside>
        </Container>
      </article>
    </main>
  );
}

type DatabaseArticle = NonNullable<
  Awaited<ReturnType<typeof getPublishedArticleBySlug>>
>;

function DatabaseArticle({ article }: { article: DatabaseArticle }) {
  const publishedAt = article.publishedAt ?? article.createdAt;
  return (
    <main>
      <article>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Article",
            headline: article.title,
            description: article.excerpt,
            datePublished: publishedAt.toISOString(),
            dateModified: article.updatedAt.toISOString(),
            mainEntityOfPage: absoluteUrl(`/makaleler/${article.slug}`),
            author: {
              "@type": "Person",
              name: article.author.displayName,
              url: absoluteUrl("/hakkimda"),
            },
            ...(article.coverImageUrl
              ? { image: [article.coverImageUrl] }
              : {}),
          }}
        />
        <header className="page-hero">
          <Container className="max-w-5xl">
            <Breadcrumbs
              items={[
                { label: "Ana sayfa", href: "/" },
                { label: "Makaleler", href: "/makaleler" },
                { label: article.title },
              ]}
            />
            <p className="eyebrow">{article.category?.name ?? "Makale"}</p>
            <h1 className="page-title">{article.title}</h1>
            <p className="page-lead">{article.excerpt}</p>
            <div className="text-ink-muted mt-7 flex flex-wrap gap-5 text-sm">
              <span>Yazar: {article.author.displayName}</span>
              <span>
                Yayımlanma:{" "}
                <time dateTime={publishedAt.toISOString()}>
                  {formatDate(publishedAt)}
                </time>
              </span>
              <span>
                Güncellenme:{" "}
                <time dateTime={article.updatedAt.toISOString()}>
                  {formatDate(article.updatedAt)}
                </time>
              </span>
            </div>
          </Container>
        </header>
        <Container className="max-w-5xl py-10">
          <ContentNotice />
        </Container>
        <Container className="max-w-3xl pb-20">
          <MarkdownContent content={article.content} />
          <div className="mt-10">
            <ShareButton title={article.title} />
          </div>
        </Container>
      </article>
    </main>
  );
}
