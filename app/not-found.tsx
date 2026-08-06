import Link from "next/link";

import { Container } from "@/components/ui/container";

export default function NotFound() {
  return (
    <main className="min-h-[60vh] py-20 sm:py-28">
      <Container className="max-w-3xl">
        <p className="eyebrow">404</p>
        <h1 className="page-title">Sayfa bulunamadı</h1>
        <p className="page-lead">
          Aradığınız sayfa kaldırılmış, taşınmış veya hiç oluşturulmamış
          olabilir.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link className="button-primary" href="/">
            Ana sayfaya dön
          </Link>
          <Link className="button-secondary" href="/hizmetler">
            Hizmetleri incele
          </Link>
          <Link className="button-secondary" href="/makaleler">
            Makaleleri oku
          </Link>
        </div>
      </Container>
    </main>
  );
}
