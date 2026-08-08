import type { Metadata } from "next";

import { AppointmentForm } from "@/components/appointment-form";
import { ContentNotice } from "@/components/content-notice";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "İletişim ve Randevu Talebi",
  description: "Klinik iletişim bilgileri ve güvenli randevu talebi formu.",
};

export default function ContactPage() {
  return (
    <main>
      <PageHeader
        eyebrow="İletişim"
        title="Randevu talebinizi güvenli biçimde iletin"
        lead="Bu form kesin randevu oluşturmaz. Çalışma saatleri ve hedef geri dönüş süresi klinik tarafından doğrulandıktan sonra yayımlanacaktır."
      />
      <Container className="py-10 sm:py-16">
        <ContentNotice />
        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[.7fr_1.3fr]">
          <aside className="space-y-5">
            <Card>
              <h2 className="text-xl font-bold">İletişim bilgileri</h2>
              <dl className="mt-5 space-y-4 text-sm">
                <div>
                  <dt className="font-bold">Telefon</dt>
                  <dd className="text-ink-muted mt-1">Doğrulama bekliyor</dd>
                </div>
                <div>
                  <dt className="font-bold">E-posta</dt>
                  <dd className="text-ink-muted mt-1">Doğrulama bekliyor</dd>
                </div>
                <div>
                  <dt className="font-bold">Adres</dt>
                  <dd className="text-ink-muted mt-1">Doğrulama bekliyor</dd>
                </div>
                <div>
                  <dt className="font-bold">Çalışma saatleri</dt>
                  <dd className="text-ink-muted mt-1">Doğrulama bekliyor</dd>
                </div>
              </dl>
            </Card>
            <Card>
              <h2 className="text-xl font-bold">Harita ve ulaşım</h2>
              <p className="text-ink-muted mt-3 leading-7">
                Adres doğrulandıktan sonra, mümkünse izin gerektirmeyen statik
                harita bağlantısı kullanılacaktır. Üçüncü taraf embed varsayılan
                olarak yüklenmeyecektir.
              </p>
            </Card>
            <Card className="border-warning/40 bg-amber-50">
              <h2 className="text-xl font-bold">Acil durumlar</h2>
              <p className="text-ink-muted mt-3 leading-7">
                Bu form sürekli izlenen acil yardım kanalı değildir. Kendinizin
                veya başka birinin güvenliğiyle ilgili acil risk varsa
                bulunduğunuz yerdeki güncel resmi acil yardım kanallarına
                başvurun.
              </p>
            </Card>
          </aside>
          <div className="border-border shadow-card rounded-2xl border bg-white p-6 sm:p-8">
            <AppointmentForm />
          </div>
        </div>
      </Container>
    </main>
  );
}
