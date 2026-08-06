import type { Metadata } from "next";

import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni",
  description:
    "Kişisel verilerin işlenmesine ilişkin taslak aydınlatma yapısı.",
};

export default function KvkkPage() {
  return (
    <LegalPage
      title="KVKK Aydınlatma Metni"
      lead="Kişisel verilerin hangi amaçlarla ve hangi sınırlar içinde işlendiğini açıklayacak metin yapısı."
    >
      <h2>1. Veri sorumlusu</h2>
      <p>
        Veri sorumlusunun doğrulanmış unvanı, adresi ve başvuru iletişim
        bilgileri hukuk onayından sonra eklenecektir.
      </p>
      <h2>2. İşlenen veri kategorileri</h2>
      <p>
        Randevu talebi kapsamında ad soyad, sağlanan e-posta ve/veya telefon,
        iletişim tercihi, seçilen hizmet, isteğe bağlı kısa not ile aydınlatma
        sürümü/zamanı işlenmesi planlanmaktadır. Özel nitelikli sağlık bilgisi
        istenmez.
      </p>
      <h2>3. İşleme amaçları ve hukuki sebepler</h2>
      <p>
        Talebe geri dönüş, uygunluk ve zamanlama iletişimi, bilgi güvenliği,
        kötüye kullanımın önlenmesi ve yasal yükümlülük amaçlarının kesin hukuki
        sebepleri hukuk danışmanı tarafından doldurulacaktır.
      </p>
      <h2>4. Aktarım ve hizmet sağlayıcılar</h2>
      <p>
        PostgreSQL barındırma, uygulama hosting ve Resend dahil veri işleyenler;
        veri bölgeleri ve yurt dışı aktarım değerlendirmesi tamamlandıktan sonra
        listelenecektir.
      </p>
      <h2>5. Saklama süresi</h2>
      <p>
        Randevu talebi ve denetim kayıtlarının kesin saklama süreleri henüz
        onaylanmadı. Süre sonunda güvenli silme veya anonimleştirme
        uygulanacaktır.
      </p>
      <h2>6. İlgili kişi hakları ve başvuru</h2>
      <p>
        KVKK kapsamındaki haklar ile başvuru yöntemi, doğrulanmış veri sorumlusu
        iletişim bilgileriyle birlikte hukuk onayından sonra yayımlanacaktır.
      </p>
    </LegalPage>
  );
}
