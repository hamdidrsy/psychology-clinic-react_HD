import Link from "next/link";

import {
  DesktopNavigation,
  MobileNavigation,
} from "@/components/site-navigation";
import { Container } from "@/components/ui/container";

export function SiteHeader() {
  return (
    <header className="border-border/80 bg-canvas/95 sticky top-0 z-40 border-b backdrop-blur-md">
      <Container className="flex min-h-18 items-center justify-between gap-4 py-3">
        <Link
          aria-label="Hasan Durusoy ana sayfa"
          className="group flex min-w-0 items-center gap-3 rounded-md"
          href="/"
        >
          <span
            aria-hidden="true"
            className="bg-primary grid size-10 shrink-0 place-items-center rounded-full text-sm font-extrabold text-white"
          >
            HD
          </span>
          <span className="min-w-0 leading-tight">
            <span className="text-ink group-hover:text-primary block truncate font-bold">
              Hasan Durusoy
            </span>
            <span className="text-ink-muted block truncate text-xs">
              Psikoloji Kliniği · Taslak
            </span>
          </span>
        </Link>
        <DesktopNavigation />
        <MobileNavigation />
      </Container>
    </header>
  );
}
