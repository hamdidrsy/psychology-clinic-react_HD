import type { Metadata } from "next";

import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Gizlilik Politikası",
  description:
    "Web sitesi gizlilik ve veri güvenliği uygulamalarının taslak açıklaması.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Gizlilik Politikası"
      lead="Web sitesi kullanımında verilerin nasıl korunduğunu ve hangi teknik kayıtların tutulduğunu açıklayacak taslak."
    >
      <h2>Toplanan bilgiler</h2>
      <p>
        Site, randevu talebi gönderilmedikçe doğrudan kimlik/iletişim bilgisi
        istemez. Talep işlevi etkinleştirildiğinde yalnız formda açıkça
        gösterilen ve iletişim için gerekli alanlar işlenecektir.
      </p>
      <h2>Teknik kayıtlar</h2>
      <p>
        Güvenlik ve hata teşhisi için sınırlı teknik loglar tutulabilir. Parola,
        token, cookie, tam form gövdesi, serbest not ve hassas sağlık verisi
        loglanmayacaktır.
      </p>
      <h2>Güvenlik</h2>
      <p>
        Aktarım şifrelemesi, en az yetki, güvenli oturum, rate limiting,
        yedekleme ve erişim kayıtları uygulanacaktır. Hiçbir internet sistemi
        için mutlak güvenlik garantisi verilemez.
      </p>
      <h2>Üçüncü taraflar</h2>
      <p>
        Hosting, PostgreSQL, Resend, hata izleme ve bot koruma sağlayıcıları
        seçildikten sonra işledikleri veri, amaç ve bağlantılar burada
        açıklanacaktır.
      </p>
      <h2>İletişim</h2>
      <p>
        Gizlilik soruları ve ilgili kişi başvuruları için doğrulanmış iletişim
        kanalı production yayını öncesinde eklenecektir.
      </p>
    </LegalPage>
  );
}
