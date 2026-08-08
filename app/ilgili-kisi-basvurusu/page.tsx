import { LegalPage } from "@/components/legal-page";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "İlgili Kişi Başvurusu",
  description:
    "KVKK kapsamındaki ilgili kişi başvuruları için süreç ve güvenli kimlik doğrulama ilkeleri.",
  path: "/ilgili-kisi-basvurusu",
});

export default function DataSubjectRequestPage() {
  return (
    <LegalPage
      title="İlgili Kişi Başvurusu"
      lead="Kişisel verilerinizle ilgili erişim, düzeltme, silme ve itiraz taleplerinin güvenli biçimde ele alınması için teknik süreç."
      version="ilgili-kisi-basvurusu-2026-08-09-v1-draft"
    >
      <h2>Başvuru kapsamı</h2>
      <p>
        Verinizin işlenip işlenmediğini öğrenme, işlenen veriler hakkında bilgi
        isteme, amacına uygun kullanımı öğrenme, aktarılan tarafları öğrenme,
        yanlış veriyi düzeltme, şartları varsa silme/yok etme ve ilgili diğer
        KVKK haklarınıza ilişkin talepte bulunabilirsiniz.
      </p>
      <h2>Başvuru kanalı</h2>
      <p>
        Doğrulanmış posta, KEP veya e-posta kanalı veri sorumlusu bilgileriyle
        birlikte production öncesinde burada yayımlanacaktır. Bu kanal
        belirlenmeden hassas kimlik belgesi normal e-postayla gönderilmemelidir.
      </p>
      <h2>Gerekli asgari bilgiler</h2>
      <p>
        Talebin konusu, varsa randevu referans kodu, sizinle güvenli iletişim
        kurulacak kanal ve yanıt tercihi yeterli olacak şekilde istenir. Kimlik
        doğrulama talebin niteliğine ve riske orantılı yapılır; gereksiz kimlik
        fotokopisi veya sağlık bilgisi istenmez.
      </p>
      <h2>Yanıt ve kayıt</h2>
      <p>
        Başvuru en kısa sürede ve kural olarak en geç 30 gün içinde
        değerlendirilir. Başvuru kimliği, alınma/yanıt zamanı, karar ve işlemi
        yapan yetkili denetlenebilir biçimde kaydedilir; talep içeriği uygulama
        loglarına yazılmaz.
      </p>
      <h2>Silme talebi</h2>
      <p>
        Kimlik ve talep sahipliği doğrulandıktan sonra yasal saklama zorunluluğu
        bulunmayan kayıtlar silinir veya uygun yöntemle anonimleştirilir. İşlem
        öncesi etkilenen ana kayıt, bağlı durum geçmişi ve bildirim kaydı
        belirlenir; sonuç ilgili kişiye güvenli kanaldan bildirilir.
      </p>
    </LegalPage>
  );
}
