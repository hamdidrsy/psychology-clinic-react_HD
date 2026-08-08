import type { ReactNode } from "react";

import { ContentNotice } from "@/components/content-notice";
import { PageHeader } from "@/components/page-header";
import { Container } from "@/components/ui/container";

export function LegalPage({
  title,
  lead,
  version,
  effectiveDate,
  children,
}: {
  title: string;
  lead: string;
  version: string;
  effectiveDate?: string;
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
            <strong>Durum:</strong>{" "}
            {effectiveDate
              ? "Yürürlükte"
              : "Hukuk onayı bekleyen teknik taslak"}
          </p>
          <p>
            <strong>Sürüm:</strong> {version}
          </p>
          <p>
            <strong>Yürürlük tarihi:</strong>{" "}
            {effectiveDate ?? "Henüz yürürlükte değildir"}
          </p>
          {children}
        </div>
      </Container>
    </main>
  );
}
