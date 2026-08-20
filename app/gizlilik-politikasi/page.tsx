import { LegalPage } from "@/components/legal-page";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Gizlilik Politikası",
  description:
    "Web sitesindeki veri işleme ve güvenlik uygulamalarının teknik gizlilik taslağı.",
  path: "/gizlilik-politikasi",
});

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Gizlilik Politikası"
      lead="Web sitesi kullanımında verilerin nasıl korunduğunu ve hangi teknik kayıtların tutulduğunu açıklayan taslak."
      version="gizlilik-2026-08-09-v1-draft"
    >
      <h2>Toplanan bilgiler</h2>
      <p>
        Randevu formundaki ad, e-posta ve telefon gönderilmeden önce
        kullanıcının tarayıcısında AES-GCM ile şifrelenir. Sunucu yalnız şifreli
        paket ile hizmet/zaman gibi sınırlı metadata bilgisini alır. Serbest
        not, sağlık öyküsü, kimlik ve ödeme bilgisi istenmez.
      </p>
      <h2>Teknik kayıtlar</h2>
      <p>
        Rate limit anahtarları ve kısa süreli kötüye kullanım özetleri geri
        döndürülemez biçimde tutulur. Parola, oturum belirteci, tam form
        gövdesi, ciphertext, çözme anahtarı, takip sırrı, e-posta ve telefon
        uygulama loglarına yazılmaz.
      </p>
      <h2>Güvenlik</h2>
      <p>
        Tarayıcıda doğrulanmış şifreleme, HTTPS, güvenli yönetici oturumu, rol
        kontrolü, rate limit, veri minimizasyonu, denetim kaydı ve süreli silme
        uygulanır. Çözme anahtarının iki kopyası yalnız kullanıcıda kalır.
        Hiçbir internet sistemi için mutlak güvenlik garantisi verilemez.
      </p>
      <h2>Üçüncü taraflar ve yurt dışı aktarım</h2>
      <p>
        Yerel geliştirmede PostgreSQL 14 kullanılır. Production
        hosting/veritabanı bölgesi seçilmemiştir. Resend bildirimi
        yapılandırılmadığı sürece e-posta aktarımı gerçekleşmez.
        Etkinleştirmeden önce sözleşme, alt işleyen, saklama ve KVKK 9. madde
        mekanizması onaylanacaktır.
      </p>
      <h2>Otomatik karar verme</h2>
      <p>
        Randevu uygunluğu veya kullanıcı hakkında otomatik karar/profil
        oluşturma yapılmaz. Rate limit yalnız kötüye kullanım denetimidir.
      </p>
      <h2>İletişim</h2>
      <p>
        Gizlilik soruları ve ilgili kişi başvuruları için doğrulanmış kanal,
        veri sorumlusu kimliğiyle birlikte production öncesinde eklenecektir.
      </p>
    </LegalPage>
  );
}
