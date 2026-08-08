import { ContentNotice } from "@/components/content-notice";
import { PageHeader } from "@/components/page-header";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { faqs } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Sık Sorulan Sorular",
  description:
    "Randevu talebi, görüşmeler ve gizlilik hakkında sık sorulan sorular.",
  path: "/sik-sorulan-sorular",
});

export default function FaqPage() {
  return (
    <main>
      <PageHeader
        eyebrow="Sık sorulan sorular"
        title="İlk adımdan önce merak edilenler"
        lead="Yanıtlar genel bilgi sunar. Klinik çalışma koşulları ve hukuki metinler onaylandıkça güncellenecektir."
      />
      <Container className="max-w-5xl py-10 sm:py-16">
        <ContentNotice />
        <div className="divide-border border-border mt-10 divide-y rounded-2xl border bg-white px-5 sm:px-8">
          {faqs.map((faq) => (
            <details className="group py-5" key={faq.question}>
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 text-lg font-bold marker:hidden">
                {faq.question}
                <span
                  aria-hidden="true"
                  className="text-primary text-2xl group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="text-ink-muted max-w-3xl pt-2 pb-3 leading-7">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
        <div className="bg-primary mt-10 rounded-2xl p-7 text-white sm:p-9">
          <h2 className="text-2xl font-bold">Sorunuz burada yok mu?</h2>
          <p className="mt-3 max-w-2xl leading-7 text-white/80">
            Onaylı iletişim bilgileri yayınlandığında klinikle güvenli kanaldan
            iletişime geçebilirsiniz.
          </p>
          <ButtonLink
            className="text-primary hover:bg-surface-muted mt-6 bg-white"
            href="/iletisim"
          >
            İletişim sayfası
          </ButtonLink>
        </div>
      </Container>
    </main>
  );
}
