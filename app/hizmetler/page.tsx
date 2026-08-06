import type { Metadata } from "next";

import { ContentNotice } from "@/components/content-notice";
import { PageHeader } from "@/components/page-header";
import { ServiceCard } from "@/components/service-card";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { services } from "@/lib/content";

export const metadata: Metadata = {
  title: "Hizmetler",
  description:
    "Psikoloji kliniğinin taslak görüşme ve değerlendirme hizmetlerini inceleyin.",
};

export default function ServicesPage() {
  return (
    <main>
      <PageHeader
        eyebrow="Hizmetler"
        title="İhtiyaca göre değerlendirilen görüşme seçenekleri"
        lead="Her hizmetin kapsamı ve uygunluğu kişiye özel ilk değerlendirmede ele alınır; bu sayfa tanı veya sonuç vaadi içermez."
      />
      <Container className="pt-10">
        <ContentNotice />
      </Container>
      <Section
        title="Hizmet başlıkları"
        description="Nihai hizmet adları, hedef kitle ve çalışma biçimleri klinik onayından sonra güncellenecektir."
      >
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.slug} service={service} />
          ))}
        </div>
      </Section>
      <section className="border-border border-y bg-white py-14">
        <Container className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-bold">
              Hangi hizmetin uygun olduğundan emin değil misiniz?
            </h2>
            <p className="text-ink-muted mt-2 leading-7">
              Talebinizde “kararsızım” seçeneğini kullanabilirsiniz.
            </p>
          </div>
          <ButtonLink href="/iletisim#randevu-formu">
            Randevu talebi oluştur
          </ButtonLink>
        </Container>
      </section>
    </main>
  );
}
