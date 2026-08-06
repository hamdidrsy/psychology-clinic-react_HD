# Keşif ve Gereksinim Belgesi

- Durum: Taslak — klinik, proje sahibi ve hukuk onayı bekliyor
- Sürüm: 0.1
- Tarih: 2026-08-06
- Kapsam: Psychology Clinic Hasan Durusoy web sitesi

Bu belge, geliştirme başlamadan önce ürün hedefini, kullanıcıları, işlevleri, kalite hedeflerini ve açık kararları tek yerde toplar. “Onay bekliyor” olarak işaretlenen bilgiler gerçek klinik verisiyle doğrulanmadan yayına alınamaz.

## 1. Ürün amacı ve kapsam

Sitenin amacı Hasan Durusoy’un doğrulanmış mesleki bilgilerini ve hizmetlerini güven veren, etik ve anlaşılır bir dille sunmak; bilgilendirici makalelerle organik erişim sağlamak ve ziyaretçinin kesin randevu oluşturmadan güvenli bir randevu talebi iletebilmesini sağlamaktır.

### Birincil hedefler

1. Uzmanın kimliği, yetkinliği, yaklaşımı ve iletişim biçimi hakkında güven oluşturmak.
2. Hizmetleri, sınırlarını ve kimlere yönelik olduklarını açıkça anlatmak.
3. Erişilebilir ve kaynaklı makalelerle kullanıcının doğru bilgiye ulaşmasını sağlamak.
4. Mobilde hızlı ve düşük sürtünmeli randevu talebi toplamak.
5. Klinik sahibinin makaleleri ve randevu taleplerini güvenli panelden yönetmesini sağlamak.
6. SEO, erişilebilirlik, güvenlik ve KVKK gerekliliklerini tasarımın başından itibaren karşılamak.

### Kapsam içi

- Herkese açık kurumsal, hizmet, makale, SSS, iletişim/randevu ve yasal sayfalar.
- Randevu talebinin doğrulanması, bot/rate-limit kontrolü, PostgreSQL’e kaydı ve Resend bildirimi.
- Güvenli admin girişi; makale ve randevu talebi yönetimi.
- Teknik SEO, yapılandırılmış veri, sitemap ve robots.
- Responsive tasarım, WCAG 2.2 AA hedefi, test, izleme ve geri alma hazırlığı.

### İlk sürümde kapsam dışı

- Online ödeme, otomatik takvim uygunluğu ve kesin randevu rezervasyonu.
- Görüntülü görüşme/tele-sağlık altyapısı.
- Hasta/danışan dosyası, terapi notu, tanı, reçete veya tıbbi kayıt yönetimi.
- Kullanıcı hesabı ve danışan portalı.
- Canlı sohbet ve acil destek hattı işlevi.
- Çoklu dil; altyapı gelecekteki ihtiyacı gereksiz yere engellemeyecek ancak ilk sürüm yalnız Türkçe olacak.

## 2. Kullanıcı grupları ve ihtiyaçları

| Kullanıcı                               | Temel ihtiyaç                                             | Başarı durumu                                                                 |
| --------------------------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------- |
| İlk kez destek arayan ziyaretçi         | Uzmanı ve süreci yargılanmadan, sade biçimde anlamak      | Güvenilir bilgiye ulaşır ve sonraki adımı bilir                               |
| Belirli bir hizmeti araştıran ziyaretçi | Hizmet kapsamını, sınırlarını ve başvuru yolunu öğrenmek  | İlgili hizmetten randevu talebine geçebilir                                   |
| Makale okuyucusu                        | Okunabilir, güncel, kaynaklı bilgi bulmak                 | İlgili makale/hizmetlere erişir; içeriğin bilgilendirme amaçlı olduğunu anlar |
| Mobil kullanıcı                         | Hızlı yüklenen, tek elle kullanılabilen arayüz            | Menü ve formu yatay kayma/zoom gerektirmeden kullanır                         |
| Engelli kullanıcı                       | Klavye, ekran okuyucu, zoom ve yeterli kontrast desteği   | Kritik içeriğe ve forma eşdeğer erişim sağlar                                 |
| Randevu talebi bırakan ziyaretçi        | Asgari veriyle güvenli talep iletmek ve sonucunu anlamak  | Talebin alındığını, kesin randevu olmadığını ve beklenen geri dönüşü görür    |
| Yönetici/içerik editörü                 | Makale ve talepleri güvenli, izlenebilir şekilde yönetmek | Yetkisi dahilinde işlemi tamamlar, hata/başarı geri bildirimi alır            |
| Arama motoru                            | Canonical, anlamlı ve erişilebilir içerik keşfetmek       | Yalnız yayınlanmış herkese açık sayfaları doğru metadata ile tarar            |

## 3. Başarı ölçütleri

İlk 30 gün ölçüm temeli oluşturma dönemidir. İş hedeflerinin kesin sayısal eşikleri proje sahibi tarafından onaylanacaktır.

### Teknik ve kalite hedefleri

- Core Web Vitals, gerçek kullanıcı verisinin 75. yüzdelik diliminde “iyi”: LCP ≤ 2,5 sn, INP ≤ 200 ms, CLS ≤ 0,1.
- Kritik sayfalarda Lighthouse erişilebilirlik hedefi ≥ 95; otomatik araçların bulmadığı sorunlar için manuel klavye ve ekran okuyucu testi.
- Randevu talebi kayıt başarısı ≥ %99,5; DB’ye kaydedilmiş talep e-posta hatasında kaybolmaz.
- Uptime hedefi aylık ≥ %99,9; planlı bakım ayrıca kaydedilir.
- Production’da açık kritik/yüksek güvenlik bulgusu: 0.
- Kırık iç bağlantı ve indexlenebilir 5xx URL: 0.

### Ürün/iş ölçümleri — onay bekliyor

- Randevu formu başlatma ve başarıyla tamamlama oranı.
- Spam hariç, iletişim kurulabilir ve hizmet kapsamına uygun talep oranı.
- Organik gösterim, organik tıklama, markasız sorgu ve indexlenen geçerli sayfa eğilimi.
- Hizmet detayından randevu sayfasına geçiş oranı.
- Takip için analitik aracı eklenirse yalnız gerekli consent ve veri minimizasyonu sonrası etkinleştirilecek.

## 4. İçerik ilkeleri ve envanter durumu

### İçerik ilkeleri

- Dil sakin, açık, kapsayıcı ve damgalamayan bir Türkçe kullanır.
- Tanı koymaz; kesin sonuç, iyileşme veya tedavi garantisi vermez.
- Korku, aciliyet baskısı veya kullanıcı kırılganlığını sömüren CTA kullanmaz.
- Mesleki unvan, eğitim, üyelik ve uzmanlık iddiaları belgeyle doğrulanır.
- Makaleler bilgilendirme amaçlıdır; kişiye özel değerlendirme yerine geçmediği belirtilir.
- Acil/kriz durumları için klinik ve hukuk tarafından onaylanan, güncel resmi kanallara yönlendiren metin kullanılır.
- Yazar, ilk yayın ve güncellenme tarihi görünür olur; tıbbi/psikolojik iddialar güvenilir kaynaklara dayanır.

### Toplanması ve onaylanması gereken içerik

| İçerik             | Gerekli bilgiler                                                                      | Durum / onay                    |
| ------------------ | ------------------------------------------------------------------------------------- | ------------------------------- |
| Uzman profili      | Tam ad, kullanılacak unvan, eğitim, sertifika, deneyim, üyelik ve doğrulama belgeleri | Bekliyor — klinik onayı         |
| Biyografi/yaklaşım | Birinci/üçüncü şahıs tercihi, yaklaşım, etik sınırlar ve çalışma prensibi             | Bekliyor — klinik onayı         |
| Hizmetler          | Ad, kısa açıklama, kapsam, hedef kitle, yöntem/süre bilgisi ve kapsam dışı durumlar   | Bekliyor — klinik onayı         |
| Makaleler          | İlk başlıklar, kategori, yazar, kaynak, yayın takvimi ve kapak görseli                | Bekliyor — içerik onayı         |
| SSS                | Süreç, ücret bilgisinin gösterim biçimi, iptal, online/yüz yüze görüşme ve gizlilik   | Bekliyor — klinik onayı         |
| İletişim           | Telefon, e-posta, açık adres, hizmet bölgesi, harita, sosyal hesap, çalışma saati     | Bekliyor — doğrulama            |
| Operasyon          | Randevu geri dönüş süresi, tercih edilen iletişim kanalları, bildirim alıcıları       | Bekliyor — proje sahibi         |
| Yasal              | KVKK aydınlatma, gizlilik, çerez, saklama ve ilgili kişi başvuru kanalı               | Bekliyor — hukuk onayı          |
| Görseller          | Portre, klinik fotoğrafları, logo, sosyal paylaşım görseli; kullanım/lisans belgesi   | Bekliyor — proje sahibi         |
| Font/ikon          | Seçilen lisans ve self-host/üçüncü taraf kullanım koşulları                           | Tasarım aşamasında belirlenecek |

## 5. Sayfa ve URL gereksinimleri

Slug’lar küçük harf, tire ayrımlı ve mümkün olduğunca kısa olacaktır. Türkçe karakterlerin URL’de kullanılıp kullanılmayacağı bilgi mimarisi aşamasında tek kurala bağlanacaktır.

| Sayfa            | Önerilen URL                                    | Index | Temel amaç                                          |
| ---------------- | ----------------------------------------------- | ----- | --------------------------------------------------- |
| Ana sayfa        | `/`                                             | Evet  | Güven, hizmet özeti, uzman tanıtımı ve ana CTA      |
| Hakkımda         | `/hakkimda`                                     | Evet  | Doğrulanmış profil ve yaklaşım                      |
| Hizmetler        | `/hizmetler`                                    | Evet  | Tüm hizmetleri karşılaştırılabilir listelemek       |
| Hizmet detayı    | `/hizmetler/[slug]`                             | Evet  | Tek hizmeti ayrıntılı açıklamak                     |
| Makaleler        | `/makaleler`                                    | Evet  | Yayınlanmış içerikleri listelemek                   |
| Makale detayı    | `/makaleler/[slug]`                             | Evet  | Kaynaklı makaleyi göstermek                         |
| SSS              | `/sik-sorulan-sorular`                          | Evet  | Yaygın soruları yanıtlamak                          |
| İletişim/randevu | `/iletisim`                                     | Evet  | İletişim bilgileri ve randevu talebi                |
| Talep sonucu     | Aynı sayfada durum veya `/iletisim/tesekkurler` | Hayır | Talebin alındığını belirtmek; karar sonraki aşamada |
| KVKK             | `/kvkk-aydinlatma-metni`                        | Evet  | Veri işleme konusunda aydınlatmak                   |
| Gizlilik         | `/gizlilik-politikasi`                          | Evet  | Site gizlilik yaklaşımını açıklamak                 |
| Çerez            | `/cerez-politikasi`                             | Evet  | Çerezleri ve tercihleri açıklamak                   |
| Admin giriş      | `/admin/giris`                                  | Hayır | Yetkili giriş                                       |
| Admin panel      | `/admin` ve alt yollar                          | Hayır | Makale/randevu yönetimi                             |

404, hata, taslak/preview, auth callback ve filtre/arama varyasyonları indexlenmez.

## 6. Randevu talebi gereksinimleri

### Önerilen alanlar

| Alan                           | Zorunluluk                      | Kural                                                                       |
| ------------------------------ | ------------------------------- | --------------------------------------------------------------------------- |
| Ad soyad                       | Zorunlu                         | Trimlenmiş, makul uzunluk sınırı; HTML kabul edilmez                        |
| E-posta                        | Koşullu                         | Geçerli format; telefon yoksa zorunlu                                       |
| Telefon                        | Koşullu                         | Normalize edilir; e-posta yoksa zorunlu                                     |
| Tercih edilen iletişim yöntemi | Zorunlu                         | Sağlanan iletişim kanallarından biri                                        |
| İlgilenilen hizmet             | İsteğe bağlı                    | Yalnız yayınlanmış hizmet kimliği veya “kararsızım”                         |
| Kısa not                       | İsteğe bağlı                    | Sıkı uzunluk sınırı; “sağlık öyküsü/özel bilgi paylaşmayın” uyarısı         |
| Uygun iletişim zamanı          | İsteğe bağlı                    | Kesin randevu saati değildir; metin yerine sınırlı seçenekler tercih edilir |
| KVKK teyidi                    | Zorunluysa hukukça belirlenecek | Aydınlatmaya erişim; açık rıza gerekiyorsa ayrı ve sürümlü                  |
| Pazarlama izni                 | İlk sürümde yok                 | Hizmet talebi için pazarlama izni istenmez                                  |

### Kullanıcı akışı

1. Kullanıcı formun kesin randevu vermediğini ve beklenen geri dönüş süresini görür.
2. Form alanlarını doldurur; istemci doğrulaması hızlı geri bildirim sağlar.
3. Sunucu aynı kurallarla tekrar doğrular; bot, origin ve rate-limit kontrollerini uygular.
4. Geçerli talep idempotent biçimde DB’ye kaydedilir.
5. Klinik bildirim e-postası gönderilir; e-posta hatası DB kaydını geri almaz.
6. Kullanıcı kişisel ayrıntı göstermeyen başarı mesajı alır: “Talebiniz alındı; bu işlem kesin randevu değildir.”

### Hata ve yeniden gönderim davranışı

- Alan hatası ilgili label/alanla bağlanır ve özet olarak duyurulur.
- Beklenmeyen sunucu hatasında girilen veri mümkün olduğunca korunur; teknik ayrıntı gösterilmez.
- Rate limit durumunda kalan süre açıklanır, yeni kayıt/e-posta oluşturulmaz.
- Çift tıklama/aynı idempotency anahtarı tek talep üretir.
- E-posta başarısızsa kullanıcıya kayıt başarısızmış gibi mesaj verilmez; sistem retry/alarm üretir.
- Kullanıcıya otomatik alındı e-postası varsayılan olarak kapsam dışıdır; eklenmesi ayrıca onaylanır.

## 7. Yönetici ve içerik iş akışları

### Roller

- İlk sürüm rolü: `ADMIN`. Makale ve randevu taleplerinin tamamını yönetebilir.
- Gelecekte içerik ekibi büyürse `EDITOR` ayrıştırılabilir; ihtiyaç olmadan karmaşık rol sistemi kurulmaz.
- Admin kullanıcı oluşturma self-service değildir; teknik/proje sahibi kontrollü prosedür kullanır.

### Makale yaşam döngüsü

1. Taslak oluşturulur ve otomatik slug önerilir.
2. Başlık, özet, içerik, yazar, kaynak, görsel/alt metin ve SEO alanları doğrulanır.
3. Önizleme indexlenmeden kontrol edilir.
4. Yetkili admin yayınlar; yayın tarihi kaydedilir.
5. Güncellemede `updatedAt` ve gerekirse görünür güncellenme tarihi değişir.
6. Yayından kaldırılan içerik taslağa/arşive alınır; URL’nin 404/410/redirect davranışı içeriğe göre seçilir.
7. Fiziksel silme varsayılan değildir; audit ve saklama gereksinimi değerlendirilir.

### Randevu yaşam döngüsü

- Durumlar: `NEW`, `CONTACTED`, `SCHEDULED`, `CLOSED`, `CANCELLED_OR_UNSUITABLE`.
- Her durum değişimi yetkili admin, zaman ve önceki/yeni durumla loglanır.
- Liste; durum ve tarih ile filtrelenir, yeni kayıtlar önce gelir ve server-side sayfalama kullanır.
- İlk sürümde serbest arama ve CSV dışa aktarma kapsam dışıdır; kişisel veri çoğaltma riskine karşı iş ihtiyacıyla ayrıca onaylanır.
- İç not gerekirse kısa ve operasyonel tutulur; terapi/sağlık kaydı tutulmaz.

## 8. E-posta bildirimi

- Gönderen: doğrulanmış proje alan adındaki transactional adres; production alan adı seçilince kesinleşir.
- Alıcı: ortam değişkeniyle tanımlanan klinik operasyon adresi; gerçek adres onay bekliyor.
- Önerilen konu: `Yeni randevu talebi — {talep referansı}`; hassas ayrıntı konu satırına yazılmaz.
- İçerik: talep referansı, zaman, ad, sağlanan iletişim kanalı, hizmet seçimi ve admin paneline güvenli bağlantı. Serbest notun e-postaya eklenmemesi tercih edilir.
- Bildirim ancak DB kaydı başarıyla oluştuktan sonra gönderilir.
- Sağlayıcı hatası güvenli loglanır; retry ve alarm oluşturulur. Secret veya tam form payload’ı loglanmaz.
- Development/test ortamı gerçek klinik alıcısına e-posta göndermez.

## 9. Tarayıcı, cihaz ve erişilebilirlik

- Responsive aralık: 320 px genişlikten büyük masaüstü ekranlara kadar; içerik yatay kayma üretmez.
- Destek: Chrome, Edge, Firefox ve Safari’nin güncel iki ana sürümü; iOS Safari ve Android Chrome güncel iki ana sürümü.
- JavaScript zorunlu etkileşimlerde progressive enhancement mümkün olduğunca korunur; JS kapalı tam işlev garantisi verilmez.
- Hedef WCAG 2.2 AA’dır: semantic yapı, klavye erişimi, görünür focus, kontrast, form hata ilişkileri, zoom/reflow, reduced motion ve ekran okuyucu duyuruları.
- Dokunma hedefleri WCAG 2.2 ölçütlerine uygun; mobilde hover’a bağımlı bilgi yoktur.

## 10. Performans bütçesi

| Ölçüt                         | Hedef                                                                   |
| ----------------------------- | ----------------------------------------------------------------------- |
| LCP                           | ≤ 2,5 sn (75. yüzdelik)                                                 |
| INP                           | ≤ 200 ms (75. yüzdelik)                                                 |
| CLS                           | ≤ 0,1 (75. yüzdelik)                                                    |
| İlk yük route JS              | Tercihen ≤ 150 KB gzip; aşım gerekçelendirilir                          |
| Kritik sayfa toplam transferi | Tercihen ≤ 1 MB; editoryal büyük görsel hariç aşım engellenir           |
| Hero/LCP görseli              | Responsive AVIF/WebP, tipik mobil varyant tercihen ≤ 200 KB             |
| Diğer içerik görselleri       | Boyutlandırılmış, lazy-loaded, tipik varyant tercihen ≤ 150 KB          |
| Font                          | En fazla iki aile ve gerekli ağırlıklar; self-host/subset tercih edilir |
| Üçüncü taraf script           | İş gerekçesi, performans ve consent incelemesi olmadan eklenmez         |

## 11. Trafik, dayanıklılık ve veri operasyonu

### Başlangıç varsayımı

- Yerel klinik sitesi için düşük/orta trafik: normalde dakikada 100’den az sayfa isteği ve günde 100’den az gerçek randevu talebi.
- Pazarlama veya bot trafiği ani artabilir; statik/cache edilebilir içerik origin yükünü azaltır.
- Form ve admin endpoint’leri yatay ölçeklenebilir, merkezi rate-limit durumuyla tasarlanır.
- Varsayım ölçüm verisi geldikten sonra gözden geçirilir; sağlayıcı kotası yalnız bu varsayıma dayanarak satın alınmaz.

### Yedek ve kurtarma hedefi

- Production PostgreSQL otomatik günlük yedek ve mümkünse point-in-time recovery kullanır.
- Geçici başlangıç hedefi: RPO ≤ 24 saat, RTO ≤ 4 saat. Proje sahibi ve hosting seçimiyle onaylanacaktır.
- Her production migration öncesi doğrulanmış yedek alınır.
- En az üç ayda bir staging ortamına gerçek restore tatbikatı yapılır.

### Log ve veri minimizasyonu

- Güvenlik/audit logu ile uygulama hata logu ayrı amaçlarla tutulur.
- Parola, token, cookie, secret, tam form gövdesi, serbest not ve hassas sağlık verisi hiçbir loga yazılmaz.
- E-posta/telefon gerekiyorsa maskelenir veya iç sistem kimliğiyle korelasyon yapılır.
- Uygulama logları için geçici hedef 30 gün, güvenlik/audit kayıtları için 90 gündür; hukuk ve operasyon onayından sonra kesinleşir.
- Saklama süresi dolan loglar otomatik silinir; hata izleme sağlayıcısında da aynı politika uygulanır.

## 12. Dil ve yerelleştirme

- İlk sürüm dili Türkçe (`tr-TR`), saat dilimi gösterimi `Europe/Istanbul`, veri saklama zamanı UTC’dir.
- Tarih, telefon ve adres sunumu Türkçe beklentilere uygun olur.
- Çoklu dil ilk sürüm kapsamı dışıdır. İçerik/model yapısı gelecekte çeviri eklenmesini imkânsız kılacak sabit metin bağımlılıklarından kaçınır; ancak i18n kütüphanesi ihtiyaç doğmadan eklenmez.

## 13. Faz 1 kabul kriterleri

Keşif fazı aşağıdakiler sağlandığında kapanabilir:

- Kapsam içi/dışı maddeler proje sahibi tarafından onaylanmıştır.
- Uzmanın doğrulanmış profili, hizmetleri, iletişim bilgileri ve operasyon saatleri teslim edilmiştir.
- Form alanları, geri dönüş süresi, iletişim tercihleri ve bildirim alıcısı onaylanmıştır.
- Hukuk sorumlusu kriz metni, KVKK/gizlilik/çerez yaklaşımı ve saklama hedeflerini onaylamıştır.
- İlk makale/SSS envanteri ile görsel/lisans kayıtları hazırdır.
- Başarı ölçütleri ve RPO/RTO proje sahibi tarafından onaylanmıştır.
- Açık kararların sonucu bu belgeye ve gerekirse ADR/risk kaydına işlenmiştir.

## 14. Onay bekleyen sorular

1. Hasan Durusoy’un sitede kullanılacak tam mesleki unvanı, eğitimleri, uzmanlıkları ve doğrulama belgeleri nelerdir?
2. Hizmetlerin kesin adları, hedef kitleleri ve online/yüz yüze sunum biçimleri nelerdir?
3. Klinik adresi, hizmet bölgesi, telefon, e-posta, çalışma saatleri ve sosyal hesapları nelerdir?
4. Talebe kaç saat/iş günü içinde ve hangi kanaldan dönüş sözü verilecek?
5. Formda telefon ve e-postadan hangileri istenecek; en az birinin zorunlu olması onaylanıyor mu?
6. Randevu bildirimlerini hangi klinik e-posta adresi alacak?
7. İlk makale başlıkları, kategorileri, yazar ve yayın sıklığı nedir?
8. SSS’de ücret, seans süresi, iptal, online görüşme ve gizlilik konuları nasıl anlatılacak?
9. Kullanılacak logo, portre/klinik görselleri ve bunların kullanım hakları hazır mı?
10. Acil/kriz yönlendirme metnini ve KVKK belgelerini onaylayacak hukuk/klinik sorumlusu kimdir?
11. Geçici RPO 24 saat, RTO 4 saat ve log saklama hedefleri uygun mudur?
12. Başlangıçta analitik kullanılacak mı; kullanılacaksa iş amacı ve tercih edilen araç nedir?
