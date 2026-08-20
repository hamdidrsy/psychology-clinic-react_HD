import Link from "next/link";

import { LegalPage } from "@/components/legal-page";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "KVKK Aydınlatma Metni",
  description:
    "Randevu talebi kapsamında kişisel verilerin işlenmesine ilişkin teknik aydınlatma taslağı.",
  path: "/kvkk-aydinlatma-metni",
});

export default function KvkkPage() {
  return (
    <LegalPage
      title="KVKK Aydınlatma Metni"
      lead="Randevu talebi sırasında hangi verilerin, hangi sınırlar içinde işlendiğini açıklayan teknik taslak."
      version="kvkk-randevu-2026-08-09-v1-draft"
    >
      <h2>1. Veri sorumlusu</h2>
      <p>
        Veri sorumlusunun doğrulanmış adı/unvanı, açık adresi ve başvuru
        iletişim kanalı hukuk onayından sonra eklenecektir. Bu bilgiler
        tamamlanmadan metin yürürlüğe alınamaz.
      </p>
      <h2>2. İşlenen veri kategorileri ve toplama yöntemi</h2>
      <p>
        Ad soyad, sağlanan e-posta ve/veya telefon kullanıcının tarayıcısında
        şifrelenir; uygulama sunucusu ve klinik bu alanları yüz yüze anahtar
        sunumundan önce açık biçimde göremez. Hizmet kategorisi, geniş zaman
        tercihi, anonim başvuru kodu, durum ve işlem zamanları açık metadata
        olarak tutulur. Serbest not alınmaz.
      </p>
      <p>
        Güvenlik için güvenilir proxy ortamında ham IP yerine kısa süreli özet;
        tekrar gönderimi önlemek için idempotency özeti ve anonim takip için
        takip sırrının özeti tutulabilir. Çözme anahtarı klinik veya sunucu
        tarafından saklanmaz. Form hasta dosyası veya kesin randevu değildir.
      </p>
      <h2>3. Amaçlar ve hukuki sebepler</h2>
      <p>
        Talebe dönüş, iletişim ve zamanlama, bilgi güvenliği, kötüye kullanımın
        önlenmesi ve yasal yükümlülük amaçları taslak envanterde
        eşleştirilmiştir. KVKK’nın 5 ve gerekiyorsa 6. maddesindeki kesin işleme
        şartı hukuk danışmanı tarafından faaliyet bazında onaylanacaktır.
      </p>
      <p>
        Formdaki okuma teyidi açık rıza veya pazarlama izni değildir. Pazarlama
        iletişimi yapılmaz. İleride açık rıza gereken ayrı bir amaç doğarsa
        aydınlatmadan ayrı ve geri çekilebilir bir tercih sunulacaktır.
      </p>
      <h2>4. Alıcılar ve aktarım</h2>
      <p>
        Yetkili klinik yöneticileri yalnız sınırlı metadata ve şifreli pakete;
        seçilecek PostgreSQL/hosting sağlayıcısı şifreli paket ve metadata
        alanına erişebilir. Resend yalnız kimlik, takip sırrı ve ciphertext
        içermeyen genel yeni-talep bildirimi alır. Sağlayıcı, ülke/bölge,
        sözleşme ve yurt dışı aktarım mekanizması tamamlanmadan production
        aktarımı etkinleştirilmemelidir.
      </p>
      <h2>5. Saklama</h2>
      <p>
        Randevu talepleri için geçici teknik hedef 90 gündür. Süre hukuk
        onayıyla kesinleşir; süre sonunda kayıt ve bağlı bildirim/durum geçmişi
        güvenli bakım işiyle silinir. Diğer veri türleri için süreler veri yaşam
        döngüsü belgesinde yer alır.
      </p>
      <h2>6. İlgili kişi hakları</h2>
      <p>
        KVKK kapsamındaki erişim, düzeltme, silme/yok etme, aktarılan kişileri
        öğrenme ve itiraz haklarının nasıl kullanılacağı{" "}
        <Link href="/ilgili-kisi-basvurusu">
          ilgili kişi başvuru sayfasında
        </Link>{" "}
        açıklanır. Doğrulanmış başvuru kanalı production öncesinde eklenecektir.
      </p>
    </LegalPage>
  );
}
