import type { Metadata } from "next";

import { AppointmentTracker } from "@/components/appointment-tracker";
import { PageHeader } from "@/components/page-header";
import { Alert } from "@/components/ui/alert";
import { Container } from "@/components/ui/container";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Anonim Randevu Takibi",
  robots: { index: false, follow: false },
};

export default function AppointmentTrackingPage() {
  return (
    <main>
      <PageHeader
        eyebrow="Gizli takip"
        title="Anonim randevu talebinizi kontrol edin"
        lead="Klinik kimliğinizi görmeden talebinizin durumunu ve önerilen zamanı buradan öğrenin."
      />
      <Container className="py-10 sm:py-16">
        <div className="border-border mx-auto max-w-2xl rounded-2xl border bg-white p-6 shadow-sm sm:p-8">
          <Alert title="Bu ekran acil yardım kanalı değildir" variant="info">
            Acil tehlike durumunda 112’yi arayın veya en yakın acil servise
            başvurun.
          </Alert>
          <div className="mt-6">
            <AppointmentTracker />
          </div>
        </div>
      </Container>
    </main>
  );
}
