import type { Metadata } from "next";
import Link from "next/link";

import { ArticleCard } from "@/components/article-card";
import { ContentNotice } from "@/components/content-notice";
import { ServiceCard } from "@/components/service-card";
import { ButtonLink } from "@/components/ui/button-link";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { articles, faqs, services } from "@/lib/content";

export const metadata: Metadata = {
  title: "Psikoloji Kliniği",
  description:
    "Hasan Durusoy psikoloji kliniği için hizmet, makale ve randevu talebi bilgileri.",
};

export default function HomePage() {
  return (
    <main>
      <section className="page-hero py-16 sm:py-24 lg:py-28">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_.85fr]">
            <div>
              <p className="eyebrow">Hasan Durusoy · Taslak klinik sitesi</p>
              <h1 className="page-title">
                Daha anlaşılır bir ilk adım için sakin ve güvenli bir alan.
              </h1>
              <p className="page-lead">
                Hizmet kapsamını inceleyin, bilgilendirici makaleleri okuyun ve
                uygun olduğunuzda güvenli bir randevu talebi bırakın.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href="/iletisim#randevu-formu">
                  Randevu talebi oluştur
                </ButtonLink>
                <ButtonLink href="/hizmetler" variant="secondary">
                  Hizmetleri incele
                </ButtonLink>
              </div>
              <p className="text-ink-muted mt-5 text-sm leading-6">
                Talep formu kesin randevu oluşturmaz. Klinik uygun kanal
                üzerinden geri dönüş yapar.
              </p>
            </div>
            <div
              aria-hidden="true"
              className="border-border bg-surface-muted shadow-card relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-[2.5rem] border"
            >
              <div className="bg-primary/15 absolute -top-16 -right-12 size-72 rounded-full" />
              <div className="absolute right-12 bottom-10 size-48 rounded-full border-24 border-white/80" />
              <div className="shadow-card absolute bottom-18 left-10 max-w-52 rounded-2xl bg-white p-5">
                <p className="text-primary text-sm font-bold">
                  Bilgi · Güven · Açıklık
                </p>
                <p className="text-ink-muted mt-2 text-sm leading-6">
                  Gerçek uzman fotoğrafı ve marka görselleri onay sonrasında
                  eklenecektir.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-12 max-w-3xl">
            <ContentNotice />
          </div>
        </Container>
      </section>

      <Section
        eyebrow="Hizmetler"
        title="İhtiyacınızı anlamaya yönelik görüşme seçenekleri"
        description="Aşağıdaki başlıklar içerik yapısını göstermek için hazırlanmış taslaklardır; nihai kapsam klinik onayıyla yayımlanacaktır."
      >
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.slug} service={service} />
          ))}
        </div>
        <ButtonLink className="mt-8" href="/hizmetler" variant="secondary">
          Tüm hizmetleri gör
        </ButtonLink>
      </Section>

      <Section
        className="bg-white"
        eyebrow="Süreç"
        title="Randevu talebi nasıl ilerler?"
      >
        <ol className="grid gap-5 md:grid-cols-3">
          {[
            [
              "01",
              "Bilgi alın",
              "Hizmetleri ve çalışma çerçevesini inceleyin.",
            ],
            [
              "02",
              "Talep iletin",
              "Yalnız gerekli iletişim bilgileriyle formu gönderin.",
            ],
            [
              "03",
              "Geri dönüşü bekleyin",
              "Klinik uygunluk ve zamanlama için sizinle iletişim kursun.",
            ],
          ].map(([number, title, description]) => (
            <li
              className="border-border bg-canvas rounded-2xl border p-6"
              key={number}
            >
              <span className="text-primary text-sm font-extrabold">
                {number}
              </span>
              <h3 className="mt-4 text-xl font-bold">{title}</h3>
              <p className="text-ink-muted mt-2 leading-7">{description}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section
        eyebrow="Uzman hakkında"
        title="Çalışma çerçevesini tanımadan karar vermeyin"
        description="Eğitim, unvan, uzmanlık ve yaklaşım bilgileri doğrulama belgeleriyle birlikte yayımlanacaktır."
      >
        <div className="grid gap-6 lg:grid-cols-[1fr_.7fr]">
          <Card>
            <p className="text-ink-muted text-lg leading-8">
              Bu alan Hasan Durusoy’un onaylı biyografisi, mesleki yaklaşımı ve
              çalışma ilkeleri için ayrılmıştır. Doğrulanmamış sertifika veya
              uzmanlık iddiası yayımlanmayacaktır.
            </p>
            <ButtonLink className="mt-6" href="/hakkimda" variant="secondary">
              Hakkımda sayfası
            </ButtonLink>
          </Card>
          <Card className="bg-primary text-white">
            <h3 className="text-xl font-bold">Etik ve açık iletişim</h3>
            <p className="mt-3 leading-7 text-white/80">
              Görüşme sınırları, gizlilik ve uygunluk ilk iletişimde anlaşılır
              biçimde ele alınır.
            </p>
          </Card>
        </div>
      </Section>

      <Section
        className="bg-white"
        eyebrow="Makaleler"
        title="Süreci anlamaya yardımcı kısa okumalar"
      >
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard article={article} key={article.slug} />
          ))}
        </div>
        <ButtonLink className="mt-8" href="/makaleler" variant="secondary">
          Tüm makaleler
        </ButtonLink>
      </Section>

      <Section
        eyebrow="Sık sorulanlar"
        title="İlk adımdan önce merak edilenler"
      >
        <div className="divide-border border-border divide-y rounded-2xl border bg-white px-5 sm:px-7">
          {faqs.slice(0, 4).map((faq) => (
            <details className="group py-5" key={faq.question}>
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-bold marker:hidden">
                {faq.question}
                <span
                  aria-hidden="true"
                  className="text-primary text-2xl group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="text-ink-muted max-w-3xl pb-2 leading-7">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
        <Link
          className="text-link mt-7 inline-block font-bold underline underline-offset-4"
          href="/sik-sorulan-sorular"
        >
          Tüm soruları incele
        </Link>
      </Section>

      <section className="bg-primary py-16 text-white sm:py-20">
        <Container className="flex flex-col items-start justify-between gap-7 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              İletişime geçmeye hazır mısınız?
            </h2>
            <p className="mt-3 text-lg leading-8 text-white/80">
              Talebinizi asgari bilgiyle iletin. Bu işlem kesin randevu
              oluşturmaz.
            </p>
          </div>
          <ButtonLink
            className="text-primary hover:bg-surface-muted bg-white"
            href="/iletisim#randevu-formu"
          >
            Randevu talebi oluştur
          </ButtonLink>
        </Container>
      </section>
    </main>
  );
}
