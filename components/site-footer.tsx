import Link from "next/link";

import { CookiePreferencesButton } from "@/components/cookie-preferences";
import { Container } from "@/components/ui/container";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-border bg-ink border-t text-white">
      <Container className="py-12 sm:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xl font-bold">Hasan Durusoy</p>
            <p className="mt-3 text-sm leading-6 text-white/75">
              Bu sitedeki bilgiler genel bilgilendirme amaçlıdır; kişiye özel
              değerlendirme veya acil yardım hizmeti değildir.
            </p>
          </div>
          <div>
            <h2 className="footer-title">Sayfalar</h2>
            <ul className="footer-links">
              <li>
                <Link href="/hakkimda">Hakkımda</Link>
              </li>
              <li>
                <Link href="/hizmetler">Hizmetler</Link>
              </li>
              <li>
                <Link href="/makaleler">Makaleler</Link>
              </li>
              <li>
                <Link href="/sik-sorulan-sorular">Sık sorulanlar</Link>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="footer-title">İletişim</h2>
            <p className="mt-3 text-sm leading-6 text-white/75">
              Telefon, e-posta, adres ve çalışma saatleri doğrulandıktan sonra
              burada yayımlanacaktır.
            </p>
            <Link
              className="mt-4 inline-block font-bold underline underline-offset-4"
              href="/iletisim"
            >
              İletişim sayfası
            </Link>
          </div>
          <div>
            <h2 className="footer-title">Yasal</h2>
            <ul className="footer-links">
              <li>
                <Link href="/kvkk-aydinlatma-metni">KVKK aydınlatma</Link>
              </li>
              <li>
                <Link href="/ilgili-kisi-basvurusu">İlgili kişi başvurusu</Link>
              </li>
              <li>
                <Link href="/gizlilik-politikasi">Gizlilik politikası</Link>
              </li>
              <li>
                <Link href="/cerez-politikasi">Çerez politikası</Link>
              </li>
              <li>
                <CookiePreferencesButton compact />
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-white/15 pt-6 text-sm leading-6 text-white/70">
          <p>
            Acil bir güvenlik riski varsa bu siteyi beklemeyin; bulunduğunuz
            yerdeki güncel resmi acil yardım kanallarına başvurun.
          </p>
          <p className="mt-4">
            © {year} Hasan Durusoy. Tüm hakları saklıdır. Taslak arayüz.
          </p>
        </div>
      </Container>
    </footer>
  );
}
