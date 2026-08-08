import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import { absoluteUrl } from "@/lib/seo";

export type BreadcrumbItem = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.label,
            ...(item.href ? { item: absoluteUrl(item.href) } : {}),
          })),
        }}
      />
      <nav aria-label="Sayfa yolu" className="text-ink-muted mb-7 text-sm">
        <ol className="flex flex-wrap items-center gap-2">
          {items.map((item, index) => (
            <li
              className="flex items-center gap-2"
              key={`${item.label}-${index}`}
            >
              {index > 0 && <span aria-hidden="true">/</span>}
              {item.href ? (
                <Link
                  className="hover:text-primary rounded-sm underline underline-offset-4"
                  href={item.href}
                >
                  {item.label}
                </Link>
              ) : (
                <span aria-current="page" className="text-ink font-semibold">
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
