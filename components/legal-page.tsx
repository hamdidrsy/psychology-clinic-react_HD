import type { ReactNode } from "react";

import { ContentNotice } from "@/components/content-notice";
import { PageHeader } from "@/components/page-header";
import { Container } from "@/components/ui/container";

export function LegalPage({
  title,
  lead,
  children,
}: {
  title: string;
  lead: string;
  children: ReactNode;
}) {
  return (
    <main>
      <PageHeader
        breadcrumbs={[{ label: "Ana sayfa", href: "/" }, { label: title }]}
        eyebrow="Yasal bilgilendirme · Taslak"
        title={title}
        lead={lead}
      />
      <Container className="max-w-5xl py-10 sm:py-16">
        <ContentNotice />
        <div className="prose-content border-border shadow-card mt-10 rounded-2xl border bg-white p-6 sm:p-10">
          <p>
            <strong>Durum:</strong> Hukuk onayı bekleyen teknik taslak
          </p>
          <p>
            <strong>Yürürlük tarihi:</strong> Henüz yürürlükte değildir
          </p>
          {children}
        </div>
      </Container>
    </main>
  );
}
