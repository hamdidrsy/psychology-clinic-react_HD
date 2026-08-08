import { CookiePreferencesButton } from "@/components/cookie-preferences";
import { LegalPage } from "@/components/legal-page";
import { cookiePreferenceVersion } from "@/lib/privacy/cookie-preferences";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Çerez Politikası",
  description:
    "Sitedeki zorunlu çerez ve tarayıcı depolama kullanımına ilişkin politika taslağı.",
  path: "/cerez-politikasi",
});

export default function CookiePolicyPage() {
  return (
    <LegalPage
      title="Çerez Politikası"
      lead="Sitenin kullandığı zorunlu teknik depolama ve gelecekte eklenebilecek izinli kategoriler."
      version="cerez-2026-08-09-v1-draft"
    >
      <h2>Mevcut kullanım</h2>
      <p>
        Analitik, reklam veya pazarlama çerezi/script’i etkin değildir.
        Ziyaretçi takibi veya üçüncü taraf profil oluşturma yapılmaz.
      </p>
      <h2>Zorunlu kayıtlar</h2>
      <ul>
        <li>
          Yönetici oturumu: yalnız yetkili girişinde kullanılan HttpOnly,
          SameSite ve en fazla 8 saatlik güvenlik çerezi.
        </li>
        <li>
          Tercih kaydı: yalnız zorunlu kullanım seçimini, sürümü ve zamanı
          tarayıcının local storage alanında tutar; sunucuya gönderilmez.
        </li>
      </ul>
      <p>
        Mevcut tercih sürümü: <strong>{cookiePreferenceVersion}</strong>. Tercih
        kullanıcı silene veya politika sürümü değişene kadar kalır.
      </p>
      <h2>Gelecekte zorunlu olmayan araçlar</h2>
      <p>
        Analitik, pazarlama, harita veya video eklenirse ilgili script/istek
        önceden izin alınmadan çalıştırılmayacak; kategori bazlı kabul, ret ve
        aynı kolaylıkla geri çekme sunulacaktır.
      </p>
      <h2>Tercihinizi yönetin</h2>
      <p>
        Mevcut teknik tercih kaydını aşağıdaki düğmeyle kaydedebilir veya
        silebilirsiniz.
      </p>
      <div className="mt-5">
        <CookiePreferencesButton />
      </div>
    </LegalPage>
  );
}
