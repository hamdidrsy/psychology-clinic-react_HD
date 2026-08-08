import { ContentNotice } from "@/components/content-notice";
import { PageHeader } from "@/components/page-header";
import { ButtonLink } from "@/components/ui/button-link";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Hakkımda",
  description:
    "Hasan Durusoy’un mesleki yaklaşımı ve çalışma çerçevesi hakkında bilgiler.",
  path: "/hakkimda",
});

export default function AboutPage() {
  return (
    <main>
      <PageHeader
        eyebrow="Hakkımda"
        title="Güven, açık iletişimle başlar."
        lead="Bu sayfa doğrulanmış eğitim, unvan, uzmanlık ve mesleki yaklaşım bilgilerinin yayımlanacağı yapıyı gösterir."
      >
        <ButtonLink href="/iletisim#randevu-formu">
          Randevu talebi oluştur
        </ButtonLink>
        <ButtonLink href="/hizmetler" variant="secondary">
          Hizmetleri incele
        </ButtonLink>
      </PageHeader>
      <Container className="pt-10">
        <ContentNotice />
      </Container>
      <Section eyebrow="Biyografi" title="Hasan Durusoy">
        <div className="grid gap-8 lg:grid-cols-[.75fr_1.25fr]">
          <div
            aria-hidden="true"
            className="border-border bg-surface-muted shadow-card aspect-[4/5] rounded-[2rem] border p-8"
          >
            <div className="border-primary/35 text-ink-muted flex h-full items-end rounded-2xl border border-dashed p-5 text-sm leading-6">
              Onaylı portre fotoğrafı için ayrılan alan
            </div>
          </div>
          <div className="prose-content">
            <p>
              Hasan Durusoy’un onaylı biyografisi burada yer alacaktır. Eğitim
              kurumları, tarihler, mesleki unvan ve uzmanlık ifadeleri belgeyle
              doğrulanmadan yayımlanmayacaktır.
            </p>
            <p>
              Bu alan, çalışma yaklaşımının sade ve anlaşılır bir dille
              açıklanması; hizmetin kapsamı ve sınırlarının ziyaretçiye
              aktarılması için tasarlanmıştır.
            </p>
            <h2>Çalışma yaklaşımı</h2>
            <p>
              Yaklaşım metni klinik sahibi tarafından sağlandıktan sonra yöntem,
              hedef kitle ve görüşme biçimi gibi başlıklarla yayımlanacaktır.
              Metin kesin sonuç veya iyileşme garantisi içermeyecektir.
            </p>
            <h2>Etik çerçeve</h2>
            <p>
              Gizlilik, bilgilendirme, mesleki sınırlar ve gerektiğinde uygun
              uzmana yönlendirme ilkeleri nihai klinik ve hukuk onayıyla
              açıklanacaktır.
            </p>
          </div>
        </div>
      </Section>
      <Section
        className="bg-white"
        eyebrow="Doğrulanacak bilgiler"
        title="Eğitim ve mesleki bilgiler"
      >
        <div className="grid gap-5 md:grid-cols-3">
          {[
            [
              "Eğitim",
              "Kurum, bölüm, derece ve tarih bilgileri doğrulama belgesiyle eklenecek.",
            ],
            [
              "Uzmanlık alanları",
              "Kullanılacak mesleki ifadeler klinik sahibi tarafından onaylanacak.",
            ],
            [
              "Mesleki üyelikler",
              "Yalnız güncel ve doğrulanabilir üyelikler yayımlanacak.",
            ],
          ].map(([title, text]) => (
            <Card key={title}>
              <h3 className="text-xl font-bold">{title}</h3>
              <p className="text-ink-muted mt-3 leading-7">{text}</p>
            </Card>
          ))}
        </div>
      </Section>
    </main>
  );
}
