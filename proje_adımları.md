# Psychology Clinic Hasan Durusoy — Proje Adımları

> Proje kökü: `C:\Users\hamdi\Desktop\psychology-clinic-react_HD`  
> Teknoloji hedefi: Next.js, TypeScript, Tailwind CSS, PostgreSQL, Prisma ORM, Resend  
> Belge amacı: Keşiften canlı sonrası bakıma kadar uygulanabilir ve işaretlenebilir proje kontrol listesi.  
> Başlangıç durumu (6 Ağustos 2026): Proje kökünde yalnızca `.git` dizini bulunuyor; uygulama henüz oluşturulmamış ve Git geçmişinde commit yok.

## Kullanım ve durum tanımları

- `[ ]` Başlanmadı
- `[x]` Tamamlandı
- Gerektiğinde maddelerin sonuna `— Sorumlu:`, `— Hedef tarih:` ve `— Not:` alanları eklenir.
- Bir faz, yalnızca kendi “Çıkış kriterleri” tamamen karşılandığında tamamlanmış sayılır.
- Kapsam, güvenlik veya veri işleme kararları değiştiğinde bu belge de aynı değişiklikle güncellenir.

---

## 0. Proje yönetişimi ve karar kayıtları

- [ ] Proje sahibi, teknik sorumlu ve içerik onay sorumlusu belirlenir.
- [x] İletişim kanalı, görev takibi ve hata önceliklendirme yöntemi belirlenir. — Kayıt: `docs/governance.md`
- [x] Geliştirme, önizleme/staging ve production ortamları tanımlanır. — Kayıt: `docs/governance.md`
- [x] Git dal stratejisi ve commit/PR kuralları kararlaştırılır. — Kayıt: `docs/governance.md`
- [x] Kod inceleme, test ve production onay sorumlulukları ayrıştırılır. — Kayıt: `docs/governance.md`; kişi atamaları bekleniyor.
- [x] Mimari karar kayıtları için `docs/decisions` yapısı planlanır.
- [x] “Tamamlandı” tanımı belirlenir: kod, test, erişilebilirlik, güvenlik, SEO, dokümantasyon ve onay. — Kayıt: `docs/governance.md`
- [x] Risk kaydı açılır; teknik, hukuki, içerik ve operasyon riskleri sahipleriyle izlenir. — Kayıt: `docs/risk-register.md`
- [ ] Üçüncü taraf servislerin maliyetleri ve ücretsiz kota sınırları kaydedilir.

### Çıkış kriterleri

- [ ] Sorumlular, ortamlar, geliştirme akışı ve onay mekanizması yazılı olarak netleşmiştir.

## 1. Keşif ve gereksinim analizi

### İş ve kullanıcı hedefleri

- [x] Sitenin ana hedefleri sıralanır: güven oluşturma, hizmetleri anlatma, organik görünürlük ve randevu talebi toplama. — Kayıt: `docs/discovery-and-requirements.md`
- [x] Birincil kullanıcı grupları ve ihtiyaçları tanımlanır. — Kayıt: `docs/discovery-and-requirements.md`
- [x] Başarı metrikleri belirlenir: organik trafik, form tamamlama oranı, kaliteli randevu talebi ve Core Web Vitals. — Teknik hedefler belirlendi; iş eşikleri proje sahibi onayı bekliyor.
- [x] Randevu formunun yalnızca “talep” olduğu, kesin randevu oluşturmadığı kullanıcıya açıkça anlatılır. — Mesaj ve akış gereksinimi belirlendi.
- [ ] Klinik çalışma saatleri, hizmet bölgesi, iletişim kanalları ve geri dönüş süresi netleştirilir.
- [ ] Acil durum/kriz talepleri için sitenin rolü ve yönlendirme metni hukuk/uzman görüşüyle belirlenir.

### İçerik envanteri

- [ ] Psikolog adı, unvanı, eğitimleri, uzmanlıkları ve doğrulanabilir mesleki bilgiler toplanır.
- [ ] Biyografi, yaklaşım ve etik çerçeve metinleri hazırlanır.
- [ ] Hizmet listesi, her hizmetin kapsamı ve hedef kitlesi netleştirilir.
- [ ] Tanı/tedavi garantisi ima etmeyen, etik kurallara uygun dil onaylanır.
- [ ] İlk makale listesi, kategoriler, yazar bilgisi ve yayın takvimi hazırlanır.
- [ ] SSS soruları ve yanıtları hazırlanır.
- [ ] Adres, telefon, e-posta, harita, sosyal hesaplar ve çalışma saatleri doğrulanır.
- [ ] Kullanılacak fotoğraf, logo, ikon ve fontların lisansları belgelenir.
- [ ] KVKK aydınlatma, gizlilik ve çerez içerikleri hukuk uzmanıyla hazırlanır/onaylanır.

### Fonksiyonel gereksinimler

- [x] Tüm herkese açık sayfalar ve URL yapıları listelenir. — Kayıt: `docs/discovery-and-requirements.md`
- [ ] Randevu formu alanları ve zorunlulukları kesinleştirilir. — Veri minimizasyonlu öneri hazır; proje sahibi ve hukuk onayı bekliyor.
- [x] Form onayı, hata, yeniden gönderim ve teşekkür akışları tanımlanır. — Kayıt: `docs/discovery-and-requirements.md`
- [x] Yönetici rolleri ve yetkileri tanımlanır. — İlk sürüm yalnız `ADMIN`; büyüme halinde `EDITOR` değerlendirilecek.
- [x] Makale taslak, yayın, güncelleme ve yayından kaldırma akışları tanımlanır. — Kayıt: `docs/discovery-and-requirements.md`
- [x] Randevu talebi durumları tanımlanır: yeni, iletişime geçildi, planlandı, kapatıldı, iptal/uygunsuz.
- [x] Arama, filtreleme, sayfalama ve dışa aktarma gereksinimleri kararlaştırılır. — Durum/tarih filtresi ve server-side sayfalama kapsamda; serbest arama/CSV ilk sürümde kapsam dışı.
- [ ] E-posta bildiriminin alıcıları, konusu, içeriği ve hata davranışı belirlenir. — Konu/içerik/hata davranışı belirlendi; gerçek alıcı adresi bekleniyor.

### Fonksiyonel olmayan gereksinimler

- [x] Desteklenecek tarayıcı ve cihazlar belirlenir. — Güncel iki ana sürüm; 320 px ve üzeri responsive hedef.
- [x] Erişilebilirlik hedefi WCAG 2.2 AA olarak kaydedilir.
- [x] Performans bütçesi belirlenir: LCP, INP, CLS, JS ve görsel boyutları. — Kayıt: `docs/discovery-and-requirements.md`
- [x] Beklenen trafik ve ölçek varsayımları kaydedilir. — İlk canlı veriden sonra yeniden değerlendirilecek.
- [ ] Yedekleme, RPO ve RTO hedefleri belirlenir. — Geçici hedef RPO ≤ 24 saat, RTO ≤ 4 saat; proje sahibi/sağlayıcı onayı bekliyor.
- [ ] Log saklama süreleri ve kişisel veri maskeleme kuralları belirlenir. — Maskeleme kuralları ve 30/90 günlük geçici hedef hazır; hukuk/operasyon onayı bekliyor.
- [x] Türkçe ana dil ve gelecekte çoklu dil ihtiyacı kararlaştırılır. — İlk sürüm `tr-TR`; çoklu dil kapsam dışı.

### Çıkış kriterleri

- [ ] Onaylı kapsam, sayfa listesi, içerik sorumluları, başarı ölçütleri ve kabul kriterleri mevcuttur.

## 2. Bilgi mimarisi, kullanıcı akışları ve tasarım

- [x] Site haritası hazırlanır: ana sayfa, hakkımda, hizmetler, hizmet detayları, makaleler, makale detayları, SSS, iletişim/randevu, KVKK, gizlilik ve çerez. — Kayıt: `docs/information-architecture.md`
- [x] Kısa, Türkçe karakter kullanım stratejisi belirlenmiş ve kalıcı URL slug kuralları yazılır. — ASCII Türkçe transliterasyon ve kalıcı redirect kuralı belirlendi.
- [x] Ana navigasyon, mobil menü, footer ve içerik içi bağlantılar planlanır. — Kayıt: `docs/information-architecture.md`
- [x] Randevu talebi, makale okuma ve yönetici iş akışları diyagramlaştırılır. — Kayıt: `docs/information-architecture.md`
- [x] Her sayfa için içerik hiyerarşisi ve birincil CTA belirlenir. — Kayıt: `docs/information-architecture.md`
- [x] Mobil öncelikli düşük sadakatli wireframe’ler hazırlanır. — Kayıt: `docs/wireframes.md`
- [x] Tasarım sistemi belirlenir: renkler, tipografi, boşluk, grid, radius, gölge ve hareket. — Geçici marka temeli: `docs/design-system.md`; nihai marka onayı bekliyor.
- [ ] Metin/görsel kontrastları AA seviyesinde doğrulanır.
- [x] Form alanlarının label, yardım, hata ve başarı durumları tasarlanır. — Kayıt: `docs/design-system.md` ve `docs/wireframes.md`
- [x] Klavye odağı, skip link, menü/dialog davranışları tasarlanır. — Kayıt: `docs/design-system.md`
- [x] Boş, yükleniyor, hata, 404 ve 500 durumları tasarlanır. — Kayıt: `docs/wireframes.md`
- [x] Admin arayüzü için masaüstü ve mobil kullanım sınırları belirlenir. — Mobilde talep yönetimi tam; uzun makale düzenleme tablet/masaüstü öncelikli.
- [ ] Responsive tasarım klinik sahibi ve içerik sorumlusu tarafından onaylanır.

### Çıkış kriterleri

- [ ] Bilgi mimarisi, kritik kullanıcı akışları ve responsive ekran tasarımları onaylanmıştır.

## 3. Teknik mimari ve proje kurulumu

- [x] Desteklenen güncel Node.js LTS ve paket yöneticisi sürümü sabitlenir. — Node `22.20.0`, npm `>=10.9 <12`; `.nvmrc`, `.node-version` ve `engines` ile sabitlendi.
- [x] Next.js App Router, TypeScript strict mode ve Tailwind CSS ile proje oluşturulur. — Next.js `16.3.0`, React `19.2.8`, Tailwind CSS `4.3.3`.
- [ ] Uyumlu ve güncel bağımlılık sürümleri seçilir; lockfile commit edilir. — Sürümler seçildi ve `package-lock.json` üretildi; ilk Git commit’i bekliyor.
- [x] Dizin yapısı belirlenir: `app`, `components`, `lib`, `server`, `prisma`, `emails`, `public`, `tests`. — Kayıt: `docs/project-structure.md`
- [x] ESLint, Prettier ve import kuralları yapılandırılır.
- [x] Path alias ve sunucu/istemci modülü sınırları belirlenir. — `@/*`, `server-only` ve RSC-varsayılan yaklaşımı belirlendi.
- [x] Ortam değişkenleri Zod ile başlangıçta doğrulanır. — Public değişkenler başlangıçta, özellik secret’ları kullanım sınırında zorunlu doğrulanır.
- [x] Gizli değer içermeyen `.env.example` hazırlanır.
- [x] Geliştirme, test, build, lint, typecheck ve Prisma script’leri eklenir.
- [x] `.gitignore`, editör ayarları ve satır sonu kuralları hazırlanır.
- [x] CI iş akışı planlanır: install, lint, typecheck, unit/integration test ve build. — `.github/workflows/ci.yml` ve Dependabot yapılandırması eklendi.
- [x] README’ye yerel kurulum, komutlar ve ortam değişkenleri eklenir.
- [x] Dependency update ve güvenlik tarama politikası belirlenir. — Kayıt: `docs/dependency-policy.md`; production audit sonucu 0 bulgu.

### Çıkış kriterleri

- [x] Temiz kurulumdan sonra proje çalışır; lint, typecheck ve production build başarıyla tamamlanır. — `npm ci` ve `npm run check` 6 Ağustos 2026 tarihinde başarıyla doğrulandı; 2 test geçti.

## 4. Veri modeli ve PostgreSQL/Prisma

- [ ] PostgreSQL sağlayıcısı ve bölgesi; uygulama barındırmasına yakınlık ve KVKK açısından değerlendirilir.
- [ ] Geliştirme, staging ve production veritabanları ayrılır.
- [x] Prisma şeması tasarlanır. — Kayıt: `prisma/schema.prisma` ve `docs/data-model.md`
- [x] `AdminUser` modeli: kimlik, e-posta, parola özeti/harici kimlik, rol, aktiflik ve zaman damgaları.
- [x] `Article` modeli: başlık, slug, özet, içerik, kapak görseli, SEO alanları, durum, yazar ve yayın tarihi.
- [x] Gerekirse `ArticleCategory`/etiket ilişkileri modellenir. — Tek kategori ilişkisi ve slug modeli eklendi; gereksiz etiket sistemi eklenmedi.
- [x] `AppointmentRequest` modeli yalnızca gerekli alanlarla ve açık durum enum’u ile tasarlanır. — Kesin randevu veya hasta dosyası değildir.
- [x] Rıza/aydınlatma sürümü, talep zamanı ve gerekliyse asgari denetim bilgisi modellenir. — Aydınlatma sürümü/zamanı, hash tabanlı idempotency ve süreli fingerprint.
- [x] `AuditLog` gereksinimi ve kişisel veri içermeyen olay alanları tasarlanır.
- [x] Benzersiz alanlar, foreign key’ler, indeksler ve silme davranışları tanımlanır. — PostgreSQL foreign key ve ek `CHECK` constraint’leri migration’a eklendi.
- [x] Tarih/saatlerin UTC saklanması, kullanıcıya Europe/Istanbul gösterilmesi kararlaştırılır. — DB alanları `TIMESTAMPTZ(3)`.
- [x] Hassas sağlık verisi toplamaktan kaçınacak form/veri modeli gözden geçirilir. — Tanı, sağlık öyküsü, terapi notu, kimlik ve ödeme alanı modellenmedi.
- [x] İlk migration oluşturulur ve incelemeye alınır. — `prisma/migrations/20260806130000_init/migration.sql`; gerçek PostgreSQL’e uygulama sağlayıcı/bağlantı bekliyor.
- [x] Geliştirme seed verisi sahte ve kişisel veri içermeyecek şekilde hazırlanır. — Production’da çalışmayı reddeden `prisma/seed.ts`.
- [x] Prisma istemcisinin serverless bağlantı yönetimi doğrulanır. — Prisma 7 `@prisma/adapter-pg`; geliştirmede hot-reload global cache; kesin pool ayarı sağlayıcı seçimine bağlı.
- [x] Migration’ın ileri alma ve geri dönüş/yeni düzeltme stratejisi belgelenir. — Expand/contract, yedek, staging provası ve forward-fix: `docs/data-model.md`.

### Çıkış kriterleri

- [ ] Şema, migration ve indeksler kabul edilmiştir; test veritabanında tekrar üretilebilir durumdadır.

## 5. Ortak arayüz ve herkese açık sayfalar

### Temel bileşenler

- [x] Semantic HTML kullanan header, navigasyon, mobil menü, footer ve breadcrumb geliştirilir. — Aktif sayfa `aria-current`, mobil menü rota değişiminde kapanır.
- [x] Button, link, card, section, container, form alanı, alert ve modal bileşenleri hazırlanır. — Ortak bileşenler `components/ui` altında.
- [x] Skip link, görünür focus ve klavye etkileşimleri uygulanır.
- [x] Responsive görsel bileşeni; doğru boyut, format, lazy loading ve alt metin kurallarıyla hazırlanır. — `components/ui/responsive-image.tsx`; onaylı gerçek görseller bekleniyor.
- [x] Reduced-motion tercihi desteklenir.
- [x] 404, global hata ve yükleniyor durumları hazırlanır.

### Sayfalar

- [x] Ana sayfa: değer önerisi, uzman tanıtımı, hizmet özeti, süreç, seçili makaleler, SSS özeti ve CTA. — Gerçek klinik içerik/görsel onayı bekleyen taslak.
- [x] Hakkımda: biyografi, eğitim/uzmanlık, yaklaşım, etik sınırlar ve CTA. — Doğrulanmamış mesleki iddia yayımlanmıyor; içerik alanları hazır.
- [x] Hizmetler liste sayfası.
- [x] Her hizmet için benzersiz detay sayfası ve ilgili içerik bağlantıları. — 3 statik taslak hizmet rotası ve gerçek 404 davranışı.
- [x] Makaleler liste sayfası; gerekliyse kategori/arama/sayfalama. — İlk içerik hacminde arama/sayfalama gereksiz; kategori görünümü hazır.
- [x] Makale detay sayfası; tarih, güncellenme, yazar, okuma düzeni ve paylaşım bağlantıları. — 3 statik taslak makale rotası.
- [x] SSS sayfası; erişilebilir accordion veya açık içerik yapısı. — Native `details/summary` kullanıldı.
- [x] İletişim/randevu sayfası; iletişim bilgileri, çalışma saatleri, harita tercihi ve form. — Arayüz tamam; gerçek iletişim bilgileri ve form gönderimi 6. bölüm/onay bekliyor.
- [x] KVKK aydınlatma sayfası. — Hukuk onayı bekleyen teknik taslak.
- [x] Gizlilik politikası sayfası. — Hukuk onayı bekleyen teknik taslak.
- [x] Çerez politikası ve tercih yönetimi bağlantısı. — Yalnız zorunlu depolama; analitik/pazarlama etkin değil.
- [x] Footer’da yasal sayfalar ve güncel telif yılı gösterilir.

### Çıkış kriterleri

- [ ] Tüm herkese açık sayfalar içerik, responsive görünüm, klavye kullanımı ve hata durumlarıyla tamamlanmıştır. — Teknik rotalar/build/HTTP kontrolleri tamam; gerçek içerik, görsel, iletişim, hukuk ve manuel erişilebilirlik onayı bekliyor.

## 6. Randevu talep formu ve e-posta bildirimi

- [ ] En az veri ilkesiyle form alanları kesinleştirilir; serbest metinde hassas sağlık bilgisi istenmez.
- [ ] İstemci ve sunucu aynı Zod şemasından doğrulama yapar.
- [ ] Türkçe, alanla ilişkili ve erişilebilir hata mesajları hazırlanır.
- [ ] KVKK aydınlatma metnine erişim ve gerekli onay/teyit kutusu uygulanır.
- [ ] Pazarlama izni gerekiyorsa hizmet talebinden ayrı ve varsayılan kapalı tutulur.
- [ ] Server Action veya Route Handler için güven sınırı belirlenir.
- [ ] Origin/host kontrolü ve CSRF risk değerlendirmesi yapılır.
- [ ] Honeypot, minimum doldurma süresi ve gerektiğinde CAPTCHA/Turnstile uygulanır.
- [ ] IP/kimlik bazlı rate limiting uygulanır; proxy başlıkları yalnız güvenilir altyapıda kullanılır.
- [ ] Tekrarlı gönderimleri önlemek için idempotency/duplicate kontrolü eklenir.
- [ ] Veritabanı kaydı ile bildirim sırası ve hata telafisi belirlenir; kullanıcı talebi e-posta hatasında kaybolmaz.
- [ ] Resend alan adı, gönderen adresi, SPF, DKIM ve gerekiyorsa DMARC doğrulanır.
- [ ] Klinik bildirim e-postası kişisel veriyi gereksiz yere çoğaltmayacak şekilde tasarlanır.
- [ ] Kullanıcıya alındı e-postası gönderilecekse içeriği, açık rızası/hukuki dayanağı ve suistimal riski değerlendirilir.
- [ ] React Email veya eşdeğer şablon; metin alternatifiyle hazırlanır.
- [ ] Resend timeout, retry, hata logu ve alarm davranışı uygulanır.
- [ ] Başarı mesajı kesin randevu izlenimi yaratmayacak şekilde yazılır.
- [ ] Form gönderimi, doğrulama, rate limit, bot koruması, DB ve e-posta senaryoları test edilir.

### Çıkış kriterleri

- [ ] Geçerli talepler tekil kaydedilir, güvenli biçimde bildirilir; hatalar veri kaybı veya bilgi sızıntısı yaratmaz.

## 7. Güvenli yönetici kimlik doğrulama ve yetkilendirme

- [ ] Auth.js veya seçilen güncel kimlik doğrulama yaklaşımı belgelenir.
- [ ] İlk yönetici oluşturma ve erişim kurtarma prosedürü belirlenir.
- [ ] Parolalı giriş varsa Argon2id/bcrypt parametreleri ve parola politikası belirlenir.
- [ ] MFA/passkey seçeneği risk düzeyine göre değerlendirilir ve tercihen uygulanır.
- [ ] Oturum çerezleri `HttpOnly`, `Secure`, uygun `SameSite`, süre ve rotasyonla yapılandırılır.
- [ ] Login endpoint’ine rate limit, gecikme/backoff ve genel hata mesajı eklenir.
- [ ] Kullanıcı varlığını ve parola doğruluğunu sızdıran mesajlardan kaçınılır.
- [ ] Yönetici rotaları sunucu tarafında middleware’e tek başına güvenmeden korunur.
- [ ] Her mutation’da yetki kontrolü yapılır.
- [ ] Açık yönlendirme ve callback URL riskleri engellenir.
- [ ] Başarılı/başarısız giriş ve kritik admin işlemleri kişisel veri sızdırmadan loglanır.
- [ ] Oturum kapatma ve tüm oturumları geçersiz kılma akışı hazırlanır.
- [ ] Production’da demo/varsayılan hesap bulunmadığı doğrulanır.

### Çıkış kriterleri

- [ ] Yetkisiz kullanıcı admin verisine ve işlemlerine erişemez; oturum ve brute-force kontrolleri test edilmiştir.

## 8. Yönetim paneli

### Genel

- [ ] Güvenli admin layout, navigasyon ve özet ekranı hazırlanır.
- [ ] Server-side yetkilendirme tüm sayfa, sorgu ve işlemlerde uygulanır.
- [ ] Liste ekranlarına uygun sayfalama, filtreleme, sıralama ve boş durumlar eklenir.
- [ ] Kritik/değiştirici işlemlerde açık onay ve başarı/hata geri bildirimi sağlanır.

### Makale yönetimi

- [ ] Makale oluşturma ve düzenleme formu Zod ile doğrulanır.
- [ ] Taslak, yayınlanmış ve arşiv/yayından kaldırılmış durumları uygulanır.
- [ ] Slug üretimi, benzersizlik kontrolü ve değişiklikte redirect politikası uygulanır.
- [ ] İçerik editörü seçilir; Markdown/MDX veya rich text çıktısı güvenli biçimde sanitize edilir.
- [ ] Başlık hiyerarşisi, bağlantı, görsel alt metni ve önizleme kontrolleri eklenir.
- [ ] SEO başlığı, açıklama, canonical ve sosyal paylaşım görseli alanları eklenir.
- [ ] Yayın tarihi/zaman dilimi ve güncellenme tarihi doğru yönetilir.
- [ ] Görsel yükleme kullanılacaksa tür, boyut, isim, depolama ve kötü amaçlı dosya kontrolleri uygulanır.
- [ ] Silme yerine arşivleme/soft-delete ihtiyacı değerlendirilir.

### Randevu yönetimi

- [ ] Randevu talepleri en yeni öncelikli ve sayfalı listelenir.
- [ ] Durum, tarih ve gerekli iş filtresi eklenir.
- [ ] Talep detayı yalnız yetkili kullanıcıya gösterilir.
- [ ] Durum güncelleme ve gerekli iç not alanı uygulanır; iç notlarda hassas veri sınırı belirtilir.
- [ ] CSV dışa aktarma gerekiyorsa açık yetki, veri minimizasyonu ve CSV injection koruması uygulanır.
- [ ] Saklama süresi dolan talepler için silme/anonimleştirme süreci hazırlanır.
- [ ] Yetkisiz erişim ve kritik durum değişiklikleri için audit trail uygulanır.

### Çıkış kriterleri

- [ ] Yetkili yönetici makale yaşam döngüsünü ve randevu iş akışını güvenli, izlenebilir biçimde yönetebilir.

## 9. SEO ve keşfedilebilirlik

- [ ] Anahtar kelime ve arama niyeti araştırması; etik sağlık iletişimi sınırlarında yapılır.
- [ ] Her sayfa için benzersiz title, description ve H1 planlanır.
- [ ] Next.js Metadata API ile statik/dinamik metadata uygulanır.
- [ ] Canonical URL’ler tek bir production origin üzerinden üretilir.
- [ ] Open Graph ve X/Twitter metadata/görselleri eklenir.
- [ ] `robots.txt` hazırlanır; admin, auth, preview ve gereksiz yollar engellenir.
- [ ] Dinamik `sitemap.xml`; yalnız canonical ve indexlenebilir URL’leri içerir.
- [ ] Taslak, admin, sonuç/teşekkür ve filtre URL’leri `noindex` olur.
- [ ] `Organization`/uygun profesyonel işletme, `Person`, `WebSite`, `BreadcrumbList`, `Article` ve görünür içerikle uyumlu `FAQPage` JSON-LD değerlendirilir.
- [ ] Sağlık/meslek schema türleri yalnız doğrulanabilir bilgiyle ve Google kuralları gözetilerek seçilir.
- [ ] JSON-LD güvenli serialize edilir ve Rich Results Test ile doğrulanır.
- [ ] Breadcrumb ve anlamlı iç linkleme uygulanır.
- [ ] Makalelerde yazar, yayın/güncellenme tarihi ve güvenilir kaynak kullanımı görünürdür.
- [ ] 404, redirect, trailing slash ve eski slug politikaları uygulanır.
- [ ] Görseller optimize edilir; açıklayıcı dosya adı ve alt metin kullanılır.
- [ ] Search Console ve gerekirse Bing Webmaster doğrulaması planlanır.
- [ ] Production sonrası sitemap gönderimi ve index kontrolü görevlendirilir.

### Çıkış kriterleri

- [ ] Crawl/index direktifleri, metadata, canonical, sitemap ve yapılandırılmış veri otomatik test ve manuel araçlarla doğrulanmıştır.

## 10. KVKK, gizlilik, çerezler ve veri yaşam döngüsü

> Bu bölüm teknik kontrol listesidir; hukuki metinler ve hukuki dayanaklar yetkin hukuk danışmanı tarafından onaylanmalıdır.

- [ ] Veri sorumlusu, iletişim bilgileri ve işlenen veri kategorileri doğrulanır.
- [ ] İşleme amaçları, hukuki sebepler, alıcı grupları ve aktarım yapılan ülkeler/sağlayıcılar belgelenir.
- [ ] Veri envanteri ve veri akış haritası hazırlanır: tarayıcı → uygulama → PostgreSQL → Resend/log/analitik.
- [ ] Randevu talebinde özel nitelikli kişisel veri toplama riski değerlendirilir ve alanlar minimize edilir.
- [ ] Aydınlatma metni formun veri toplama noktasında erişilebilirdir.
- [ ] Açık rıza gerekiyorsa aydınlatmadan ayrı, özgür iradeyle ve kayıtlanabilir biçimde alınır.
- [ ] Saklama süreleri veri türü bazında yazılır ve otomatik silme/anonimleştirme işi planlanır.
- [ ] İlgili kişi başvuru süreci; erişim, düzeltme, silme ve itiraz talepleri için belgelenir.
- [ ] Veri ihlali müdahale ve bildirim prosedürü hazırlanır.
- [ ] Veri işleyen/alt işleyen sözleşmeleri ve sağlayıcı gizlilik koşulları incelenir.
- [ ] Yurt dışı aktarım şartları güncel mevzuat ve kurul kararlarına göre hukuk danışmanıyla değerlendirilir.
- [ ] Sadece zorunlu çerezler varsa açık ve doğru çerez politikası hazırlanır.
- [ ] Analitik/pazarlama çerezleri eklenirse önceden izin, kategori bazlı tercih, reddetme ve geri çekme uygulanır.
- [ ] Consent kaydı sürümlenir; izin öncesi üçüncü taraf script çalışmadığı doğrulanır.
- [ ] Harita/video gibi embed’ler üçüncü taraf veri aktarımı açısından consent veya privacy-enhanced yaklaşımla ele alınır.
- [ ] Analitik kullanılıyorsa IP ve kişisel veri minimizasyonu uygulanır.
- [ ] Production loglarında form gövdesi, token, parola veya hassas veri tutulmadığı doğrulanır.
- [ ] Admin erişimi, dışa aktarımlar ve veri silme işlemleri denetlenebilir olur.
- [ ] KVKK/gizlilik/çerez metinlerinde sürüm ve yürürlük tarihi bulunur.

### Çıkış kriterleri

- [ ] Hukuk onaylı metinler, teknik consent davranışı, saklama/silme ve ilgili kişi süreçleri birbiriyle tutarlıdır.

## 11. Güvenlik sertleştirme

- [ ] Tehdit modellemesi yapılır: varlıklar, aktörler, giriş noktaları, kötüye kullanım senaryoları ve önlemler.
- [ ] OWASP ASVS ve OWASP Top 10’a göre uygun kontrol listesi uygulanır.
- [ ] Tüm girdiler sunucu tarafında doğrulanır; çıktı bağlamına uygun encode edilir.
- [ ] Rich text/Markdown HTML çıktısı allowlist ile sanitize edilir.
- [ ] Prisma sorgularında raw SQL’den kaçınılır; gerekirse parametreli sorgu kullanılır.
- [ ] IDOR/BOLA testleri admin ve randevu kaynaklarında yapılır.
- [ ] Güvenli HTTP başlıkları eklenir: CSP, HSTS, `X-Content-Type-Options`, referrer ve permissions policy.
- [ ] CSP nonce/hash yaklaşımı üçüncü taraf gereksinimleriyle tasarlanır; `unsafe-inline`/`unsafe-eval` önlenir.
- [ ] Clickjacking koruması `frame-ancestors` ile uygulanır.
- [ ] CORS yalnız gerekiyorsa ve dar origin listesiyle açılır.
- [ ] Gizli anahtarlar ortam bazında ayrılır; repoya, istemci bundle’ına ve loglara girmez.
- [ ] Secret rotasyonu ve sızıntı müdahale prosedürü hazırlanır.
- [ ] Bağımlılık ve secret taraması CI’da çalıştırılır.
- [ ] Next.js/React/Prisma/Auth güvenlik duyurularının takibi sahiplenilir.
- [ ] Hata yanıtları stack trace, sorgu veya kişisel veri sızdırmaz.
- [ ] Production source map erişimi ve debug ayarları kontrol edilir.
- [ ] Upload varsa içerik türü, magic byte, boyut, dosya adı, depolama origin’i ve erişim politikası korunur.
- [ ] SSRF ve açık redirect riskleri harici URL kullanılan tüm alanlarda test edilir.
- [ ] Rate limit’in dağıtık ortamda merkezi ve fail-open/fail-closed davranışı belgelenir.
- [ ] Veritabanı kullanıcısına en az yetki verilir; TLS zorlanır.
- [ ] Yönetici ve altyapı hesaplarında MFA etkinleştirilir.
- [ ] Bağımsız güvenlik gözden geçirmesi ve mümkünse sızma testi yapılır.

### Çıkış kriterleri

- [ ] Kritik/yüksek bulgu kalmamış; kalan riskler sahip ve hedef tarihle kabul edilmiştir.

## 12. Test ve kalite güvence

### Otomatik testler

- [ ] Zod şemaları, yardımcı fonksiyonlar, slug ve tarih işlemleri için birim testleri yazılır.
- [ ] Prisma repository/service katmanı test veritabanıyla entegrasyon testine alınır.
- [ ] Randevu oluşturma; geçerli, geçersiz, duplicate, rate limit ve e-posta hatası senaryolarıyla test edilir.
- [ ] Auth, rol/yetki ve oturum süresi entegrasyon testleri yazılır.
- [ ] Makale CRUD, yayınlama ve sanitize davranışı test edilir.
- [ ] Metadata, sitemap, robots ve JSON-LD çıktıları test edilir.
- [ ] Playwright/Cypress ile kritik E2E akışları yazılır.
- [ ] Migration’lar boş ve production benzeri veri üzerinde CI/staging’de test edilir.
- [ ] E-posta şablonları render ve temel içerik testine alınır.

### Manuel kalite güvence

- [ ] Ana sayfa ve tüm navigasyon bağlantıları kontrol edilir.
- [ ] Form klavye, ekran okuyucu, mobil ve yavaş ağda test edilir.
- [ ] Chrome, Firefox, Safari ve Edge’in hedef sürümlerinde test yapılır.
- [ ] Yaygın mobil/tablet/masaüstü viewport’larında yatay taşma kontrol edilir.
- [ ] 404, 500, boş veri, uzun içerik ve bağlantı kesintisi durumları test edilir.
- [ ] Türkçe karakterler, büyük/küçük harf, tarih ve saat biçimleri kontrol edilir.
- [ ] E-posta teslimi Gmail/Outlook gibi ana istemcilerde ve spam açısından kontrol edilir.
- [ ] Tüm gerçek içerik yazım, tutarlılık, etik iddialar ve bağlantılar açısından onaylanır.

### Erişilebilirlik ve performans

- [ ] axe/Lighthouse otomatik erişilebilirlik taraması yapılır.
- [ ] Ekran okuyucu ile başlıklar, landmark’lar, menü, form ve hata duyuruları test edilir.
- [ ] Klavye odağı ve focus sırası uçtan uca doğrulanır.
- [ ] %200/%400 zoom ve reflow kontrol edilir.
- [ ] Lighthouse ve gerçek cihaz/bağlantı testleri performans bütçesini karşılar.
- [ ] Bundle analizi yapılır; gereksiz client component ve üçüncü taraf script azaltılır.
- [ ] LCP görseli, font, cache ve rendering stratejileri optimize edilir.

### Çıkış kriterleri

- [ ] CI yeşil, kritik akışlar geçmiş, erişilebilirlik/performance hedefleri karşılanmış ve kabul testi imzalanmıştır.

## 13. Gözlemlenebilirlik ve operasyon hazırlığı

- [ ] Yapılandırılmış log formatı ve korelasyon/request ID uygulanır.
- [ ] Loglarda kişisel veri ve gizli anahtar redaction kuralları test edilir.
- [ ] Hata izleme aracı, ortam ayrımı ve kaynak haritası güvenliğiyle yapılandırılır.
- [ ] Uptime/health monitoring; ana sayfa ve kritik API için hazırlanır.
- [ ] Randevu kayıt hatası, Resend hata oranı, DB bağlantı sorunu ve auth saldırısı için alarmlar tanımlanır.
- [ ] Alarm alıcısı, önem derecesi ve mesai dışı müdahale akışı belirlenir.
- [ ] Operasyon runbook’u hazırlanır: site kapalı, DB erişilemiyor, e-posta gitmiyor, admin kilitli, veri ihlali şüphesi.
- [ ] Durum sayfası ve kullanıcı iletişimi ihtiyacı değerlendirilir.
- [ ] Üçüncü taraf servis durum sayfaları ve destek kanalları kaydedilir.

### Çıkış kriterleri

- [ ] Kritik arızalar görünür, uyarılar doğru kişiye ulaşır ve temel müdahale adımları denenmiştir.

## 14. Staging, veri taşıma ve canlıya hazırlık

- [ ] Production’a yakın staging ortamı oluşturulur.
- [ ] Ortam değişkenleri ve secret’lar hosting secret manager’da tanımlanır.
- [ ] Production domain, `www`/apex tercihi ve tek yönlü redirect kararlaştırılır.
- [ ] DNS TTL değişiklikleri ve geçiş zamanı planlanır.
- [ ] TLS sertifikası ve otomatik yenileme doğrulanır.
- [ ] Production veritabanı, bağlantı havuzu, TLS ve erişim kuralları yapılandırılır.
- [ ] Otomatik yedekleme, point-in-time recovery ve saklama süresi etkinleştirilir.
- [ ] Yedekten geri yükleme staging’de gerçek bir tatbikatla doğrulanır.
- [ ] Production migration’ı için yedek, süre, kilit ve uyumluluk analizi yapılır.
- [ ] Resend production alan adı ve alıcı adresleri doğrulanır.
- [ ] Rate limit deposu ve bot koruması production anahtarlarıyla test edilir.
- [ ] Admin hesabı güvenli kanalla oluşturulur ve MFA doğrulanır.
- [ ] Gerçek içerik, yasal metinler ve görseller son onaydan geçirilir.
- [ ] Analitik/consent davranışı production benzeri ortamda doğrulanır.
- [ ] Preview/staging `noindex` ve erişim koruması doğrulanır.
- [ ] Security headers ve cookie ayarları staging’de taranır.
- [ ] Production release checklist’i ve go/no-go yetkilisi belirlenir.
- [ ] Bakım penceresi ve ilgili kişilere iletişim planı hazırlanır.

### Çıkış kriterleri

- [ ] Yedek/geri yükleme denenmiş, staging kabul edilmiş, rollback hazır ve go-live onayı alınmıştır.

## 15. Canlıya alma

- [ ] Son onaylı commit/tag ve build artifact kaydedilir.
- [ ] Değişiklik dondurma zamanı başlatılır.
- [ ] Production veritabanı yedeği alınır ve geri yüklenebilirliği teyit edilir.
- [ ] Onaylı migration önce deploy stratejisine uygun çalıştırılır.
- [ ] Uygulama production’a dağıtılır.
- [ ] DNS/domain yönlendirmesi yapılır ve TLS zinciri kontrol edilir.
- [ ] Smoke test: ana sayfa, hizmetler, makaleler, yasal sayfalar ve 404.
- [ ] Smoke test: randevu talebi veritabanına kaydolur ve bildirim ulaşır.
- [ ] Smoke test: admin giriş, makale işlemi ve randevu durum güncellemesi.
- [ ] `robots.txt`, sitemap, canonical ve production metadata doğrulanır.
- [ ] Cookie consent ve üçüncü taraf script davranışı doğrulanır.
- [ ] Log, error tracking, uptime ve uyarıların veri aldığı doğrulanır.
- [ ] Core Web Vitals ve ana sayfa Lighthouse kontrolü yapılır.
- [ ] Search Console mülkü doğrulanır ve sitemap gönderilir.
- [ ] Release notu, migration sonucu ve bilinen sorunlar kaydedilir.
- [ ] Go-live sonucu paydaşlara bildirilir.

### Çıkış kriterleri

- [ ] Kritik akışlar production’da sağlıklı, izleme aktif ve geri alma eşiği aşılmamıştır.

## 16. Geri alma (rollback) ve felaket kurtarma

### Geri alma planı

- [ ] Rollback tetikleyicileri ölçülebilir tanımlanır: hata oranı, veri kaybı, form arızası, auth açığı, performans çöküşü.
- [ ] Kararı verecek kişi ve iletişim zinciri belirlenir.
- [ ] Önceki uygulama artifact/deployment’ına tek işlemle dönüş yöntemi belgelenir.
- [ ] Geriye uyumlu expand/contract migration yaklaşımı kullanılır.
- [ ] Yıkıcı migration’lar ayrı release’e bölünür ve doğrulanmış yedek olmadan uygulanmaz.
- [ ] Uygulama rollback’i ile DB rollback/forward-fix sırası her release için yazılır.
- [ ] DNS rollback değerleri ve TTL etkisi belgelenir.
- [ ] Resend/rate-limit/diğer servis anahtarlarının eski/yeni sürüm uyumu doğrulanır.
- [ ] Rollback sonrası smoke test ve veri bütünlüğü sorguları hazırlanır.
- [ ] Olay zaman çizelgesi, kullanıcı etkisi ve alınan kararlar kaydedilir.

### Felaket kurtarma

- [ ] Tam veritabanı kaybı senaryosu ve restore komutları/runbook’u hazırlanır.
- [ ] RPO/RTO hedeflerine göre periyodik geri yükleme tatbikatı takvime bağlanır.
- [ ] Secret sızıntısında iptal/rotasyon ve oturum geçersiz kılma prosedürü denenir.
- [ ] Hosting, PostgreSQL veya Resend kesintisi için geçici çalışma/iletişim planı hazırlanır.
- [ ] Kurtarma sonrası kayıp randevu taleplerini tespit ve uzlaştırma yöntemi belirlenir.

### Çıkış kriterleri

- [ ] Rollback ve restore staging’de tatbik edilmiş; süreler hedefleri karşılamış ve runbook güncellenmiştir.

## 17. Canlı sonrası bakım ve sürekli iyileştirme

### İlk 72 saat

- [ ] Hata oranı, uptime, DB, e-posta teslimi ve form dönüşümü yakından izlenir.
- [ ] Gerçek kullanıcı Core Web Vitals ve cihaz bazlı sorunlar kontrol edilir.
- [ ] Search Console crawl/index ve yapılandırılmış veri hataları incelenir.
- [ ] Spam/rate limit davranışı yanlış pozitif ve kaçan botlar açısından ayarlanır.
- [ ] Kritik geri bildirimler hızla önceliklendirilir.

### Haftalık/aylık bakım

- [ ] Uptime, hata, güvenlik ve e-posta teslim raporları incelenir.
- [ ] Randevu kayıtlarıyla e-posta bildirimleri uzlaştırılır.
- [ ] Kırık bağlantı ve 404 raporu incelenir; gerekli redirect’ler eklenir.
- [ ] Bağımlılık, framework ve veritabanı güncellemeleri planlı şekilde uygulanır.
- [ ] Güvenlik duyuruları ve zafiyet taramaları takip edilir.
- [ ] Yedeklerin çalıştığı ve saklama politikasına uyduğu doğrulanır.
- [ ] En az periyodik olarak restore tatbikatı yapılır.
- [ ] Admin kullanıcıları ve yetkileri gözden geçirilir; ayrılan kullanıcılar kapatılır.
- [ ] Secret ve erişim anahtarları risk/politikaya göre döndürülür.
- [ ] Saklama süresi dolan kişisel veriler silinir/anonimleştirilir ve işlem kaydedilir.
- [ ] KVKK başvuruları ve güvenlik olayları için kayıtlar gözden geçirilir.
- [ ] Çerez/alt işleyen/envanter değişikliklerinde hukuki metinler güncellenir.
- [ ] Makale içerikleri doğruluk, güncellik, kaynak ve etik dil açısından periyodik incelenir.
- [ ] SEO sorguları, index kapsamı, Core Web Vitals ve içerik boşlukları değerlendirilir.
- [ ] Erişilebilirlik regresyon taraması çalıştırılır.
- [ ] Maliyet, kota ve kapasite trendleri incelenir.

### Olay ve değişiklik yönetimi

- [ ] Her production değişikliği için test, onay, release notu ve rollback adımı bulunur.
- [ ] Olaylar önem derecesine göre sınıflandırılır ve olay sonrası inceleme yapılır.
- [ ] Tekrarlayan sorunlar kalıcı aksiyona dönüştürülüp sahibi atanır.
- [ ] Mimari, veri akışı veya sağlayıcı değişikliğinde tehdit modeli ve KVKK envanteri güncellenir.

### Çıkış kriterleri

- [ ] Bakım takvimi, sahipler ve raporlama düzeni işler; güvenlik, içerik ve mevzuat güncelliği izlenir.

---

## Faz bazlı teslimat özeti

- [ ] Faz 1 — Keşif, gereksinim, içerik ve hukuk girdileri onaylandı.
- [ ] Faz 2 — Bilgi mimarisi ve responsive tasarım onaylandı.
- [ ] Faz 3 — Teknik temel, veri modeli ve CI hazır.
- [ ] Faz 4 — Herkese açık site ve randevu akışı tamamlandı.
- [ ] Faz 5 — Güvenli admin, makale ve randevu yönetimi tamamlandı.
- [ ] Faz 6 — SEO, KVKK, güvenlik ve gözlemlenebilirlik kontrolleri tamamlandı.
- [ ] Faz 7 — Otomatik/manüel test ve kabul tamamlandı.
- [ ] Faz 8 — Staging, yedek/restore ve rollback tatbikatı tamamlandı.
- [ ] Faz 9 — Production yayını ve smoke test tamamlandı.
- [ ] Faz 10 — Canlı sonrası bakım döngüsü devreye alındı.

## Açık kararlar

- [ ] Hosting sağlayıcısı:
- [ ] PostgreSQL sağlayıcısı ve veri bölgesi:
- [ ] Kimlik doğrulama yöntemi:
- [ ] Rate limiting deposu/sağlayıcısı:
- [ ] Bot koruma yöntemi:
- [ ] Görsel depolama/CDN yöntemi:
- [ ] İçerik editörü ve içerik formatı:
- [ ] Analitik aracı ve consent gereksinimi:
- [ ] Hata izleme/uptime araçları:
- [ ] Yedekleme RPO/RTO hedefleri:
- [ ] Kişisel veri saklama süreleri:
- [ ] Randevu bildirimi ve kullanıcıya otomatik yanıt politikası:
- [ ] Domain ve canonical origin:

## Yayın öncesi son imza

- [ ] Klinik sahibi / içerik onayı — Ad, tarih:
- [ ] Hukuk / KVKK onayı — Ad, tarih:
- [ ] Teknik kalite onayı — Ad, tarih:
- [ ] Güvenlik onayı — Ad, tarih:
- [ ] Production go/no-go onayı — Ad, tarih:
