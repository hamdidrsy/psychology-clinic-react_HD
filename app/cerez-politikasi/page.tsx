import { CookiePreferencesButton } from "@/components/cookie-preferences";
import { LegalPage } from "@/components/legal-page";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Çerez Politikası",
  description:
    "Sitedeki zorunlu depolama ve çerez tercihlerine ilişkin politika.",
  path: "/cerez-politikasi",
});

export default function CookiePolicyPage() {
  return (
    <LegalPage
      title="Çerez Politikası"
      lead="Sitenin kullandığı zorunlu teknik depolama ve gelecekte eklenebilecek izinli kategorilere ilişkin bilgiler."
    >
      <h2>Mevcut kullanım</h2>
      <p>
        Bu taslak sürümde analitik veya pazarlama çerezi etkin değildir. Çerez
        tercih penceresindeki “yalnız zorunlular” seçimi tarayıcının local
        storage alanında saklanır.
      </p>
      <h2>Zorunlu depolama</h2>
      <p>
        Güvenlik, oturum ve kullanıcının tercihlerini hatırlamak için teknik
        olarak gerekli kayıtlar izin gerektirmeden kullanılabilir; amaç dışı
        kullanılmaz ve makul süreyle sınırlandırılır.
      </p>
      <h2>Analitik ve pazarlama</h2>
      <p>
        Gelecekte zorunlu olmayan bir araç eklenirse varsayılan kapalı olacak,
        açık tercih alınmadan çalışmayacak ve kullanıcı tercihini aynı
        kolaylıkla geri çekebilecektir.
      </p>
      <h2>Tercihinizi yönetin</h2>
      <p>
        Mevcut teknik tercih kaydını aşağıdaki düğmeyle yeniden
        kaydedebilirsiniz.
      </p>
      <div className="mt-5">
        <CookiePreferencesButton />
      </div>
    </LegalPage>
  );
}
