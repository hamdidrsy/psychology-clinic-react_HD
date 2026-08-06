import { ButtonLink } from "@/components/ui/button-link";
import { Card } from "@/components/ui/card";
import type { ServiceContent } from "@/lib/content";

export function ServiceCard({ service }: { service: ServiceContent }) {
  return (
    <Card className="flex h-full flex-col">
      <div
        aria-hidden="true"
        className="bg-surface-muted text-primary mb-5 grid size-11 place-items-center rounded-xl font-extrabold"
      >
        {service.title.slice(0, 1)}
      </div>
      <h3 className="text-xl font-bold tracking-tight">{service.title}</h3>
      <p className="text-ink-muted mt-3 flex-1 leading-7">{service.summary}</p>
      <ButtonLink
        className="mt-6 self-start"
        href={`/hizmetler/${service.slug}`}
        variant="quiet"
      >
        Hizmeti incele
      </ButtonLink>
    </Card>
  );
}
