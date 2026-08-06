import type { ReactNode } from "react";

import { type BreadcrumbItem, Breadcrumbs } from "@/components/breadcrumbs";
import { Container } from "@/components/ui/container";

export function PageHeader({
  eyebrow,
  title,
  lead,
  breadcrumbs,
  children,
}: {
  eyebrow?: string;
  title: string;
  lead: string;
  breadcrumbs?: BreadcrumbItem[];
  children?: ReactNode;
}) {
  return (
    <header className="page-hero">
      <Container>
        {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="page-title">{title}</h1>
        <p className="page-lead">{lead}</p>
        {children && (
          <div className="mt-8 flex flex-wrap gap-3">{children}</div>
        )}
      </Container>
    </header>
  );
}
