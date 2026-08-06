import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleCard } from "@/components/article-card";
import { ContentNotice } from "@/components/content-notice";
import { PageHeader } from "@/components/page-header";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { articles, getService, services } from "@/lib/content";

type ServicePageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return services.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ServicePageProps): Promise<Metadata> {
  const service = getService((await params).slug);
  if (!service) return { title: "Hizmet bulunamadı" };
  return { title: service.title, description: service.summary };
}

export default async function ServiceDetailPage({ params }: ServicePageProps) {
  const service = getService((await params).slug);
  if (!service) notFound();
  const relatedArticles = articles.filter((article) =>
    service.relatedArticleSlugs.includes(article.slug),
  );

  return (
    <main>
      <PageHeader
        breadcrumbs={[
          { label: "Ana sayfa", href: "/" },
          { label: "Hizmetler", href: "/hizmetler" },
          { label: service.title },
        ]}
        eyebrow="Hizmet detayı"
        title={service.title}
        lead={service.summary}
      >
        <ButtonLink href={`/iletisim?service=${service.slug}#randevu-formu`}>
          Randevu talebi oluştur
        </ButtonLink>
        <ButtonLink href="/hizmetler" variant="secondary">
          Tüm hizmetler
        </ButtonLink>
      </PageHeader>
      <Container className="pt-10">
        <ContentNotice />
      </Container>
      <Section title="Hizmetin kapsamı">
        <p className="text-ink-muted max-w-3xl text-lg leading-8">
          {service.intro}
        </p>
      </Section>
      <Section className="bg-white" title="Kimler değerlendirebilir?">
        <ul className="grid gap-4 md:grid-cols-3">
          {service.suitableFor.map((item) => (
            <li
              className="border-border bg-canvas rounded-2xl border p-5 leading-7"
              key={item}
            >
              {item}
            </li>
          ))}
        </ul>
      </Section>
      <Section title="Süreç nasıl ilerler?">
        <ol className="grid gap-5 md:grid-cols-3">
          {service.process.map((item, index) => (
            <li
              className="border-border rounded-2xl border bg-white p-6"
              key={item}
            >
              <span className="text-primary font-extrabold">0{index + 1}</span>
              <p className="text-ink-muted mt-3 leading-7">{item}</p>
            </li>
          ))}
        </ol>
      </Section>
      <Section className="bg-white" title="Önemli sınırlar">
        <div className="border-warning/30 text-ink-muted max-w-3xl rounded-2xl border bg-amber-50 p-6 leading-7">
          <p>
            Bu web sayfası kişiye özel değerlendirme veya acil yardım sunmaz.
            Uygunluk ilk görüşmede ele alınır. Acil risk durumunda bulunduğunuz
            yerdeki güncel resmi acil yardım kanallarına başvurun.
          </p>
        </div>
      </Section>
      {relatedArticles.length > 0 && (
        <Section title="İlgili makaleler">
          <div className="grid gap-5 md:grid-cols-2">
            {relatedArticles.map((article) => (
              <ArticleCard article={article} key={article.slug} />
            ))}
          </div>
        </Section>
      )}
    </main>
  );
}
