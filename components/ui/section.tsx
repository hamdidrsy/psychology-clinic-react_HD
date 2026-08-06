import type { ReactNode } from "react";

import { Container } from "@/components/ui/container";

type SectionProps = {
  children: ReactNode;
  eyebrow?: string;
  title?: string;
  description?: string;
  className?: string;
  labelledBy?: string;
};

export function Section({
  children,
  eyebrow,
  title,
  description,
  className = "",
  labelledBy,
}: SectionProps) {
  const generatedId =
    labelledBy ??
    (title
      ? `section-${title.toLocaleLowerCase("tr-TR").replace(/[^a-z0-9]+/g, "-")}`
      : undefined);

  return (
    <section
      aria-labelledby={generatedId}
      className={`py-16 sm:py-20 lg:py-24 ${className}`}
    >
      <Container>
        {(eyebrow || title || description) && (
          <header className="mb-9 max-w-3xl sm:mb-12">
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            {title && (
              <h2 className="section-title" id={generatedId}>
                {title}
              </h2>
            )}
            {description && (
              <p className="section-description">{description}</p>
            )}
          </header>
        )}
        {children}
      </Container>
    </section>
  );
}
