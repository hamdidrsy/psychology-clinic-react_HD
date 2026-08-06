# Veri Modeli ve PostgreSQL Kararları

- Durum: Şema ve başlangıç migration’ı hazır; production sağlayıcısı ve saklama süreleri onay bekliyor
- Tarih: 2026-08-06
- ORM: Prisma ORM 7
- Veritabanı: PostgreSQL

## Model özeti

| Model                      | Amaç                                                    | Kişisel veri                                             |
| -------------------------- | ------------------------------------------------------- | -------------------------------------------------------- |
| `AdminUser`                | Yetkili kullanıcı, rol ve hesap durumu                  | E-posta, görünen ad, parola özeti                        |
| `ArticleCategory`          | Makale sınıflandırması                                  | Yok                                                      |
| `Article`                  | Taslak/yayın/arşiv makale yaşam döngüsü ve SEO alanları | Yazar ilişkisi dışında yok                               |
| `ArticleSlugRedirect`      | Değişen makale URL’lerinde kalıcı redirect              | Yok                                                      |
| `Service`                  | Yayınlanabilir hizmet seçeneği ve form ilişkisi         | Yok                                                      |
| `AppointmentRequest`       | Kesin randevu olmayan iletişim talebi                   | Ad, e-posta/telefon, kısa not ve tercih                  |
| `AppointmentStatusHistory` | Randevu operasyon durum geçmişi                         | Admin ilişkisi ve minimize edilmiş operasyon notu        |
| `AppointmentNotification`  | Resend gönderim/retry durumu                            | Provider mesaj kimliği; alıcı/içerik tekrarlanmaz        |
| `AuditLog`                 | Kritik yönetici işlemlerinin denetimi                   | Raw kişisel veri yasaktır; iç kimlik ve güvenli metadata |

## Veri minimizasyonu

- Tanı, terapi notu, sağlık öyküsü, reçete, kimlik numarası, doğum tarihi veya ödeme bilgisi modellenmemiştir.
- Serbest `note` alanı 1000 karakterle sınırlıdır; arayüz özel/sağlık bilgisi paylaşılmamasını söyleyecektir.
- Telefon ve e-posta şemada koşullu nullable’dır; “en az biri” ve tercih edilen kanalla tutarlılık Zod servis katmanında transaction öncesi doğrulanacaktır.
- IP adresi saklanmaz. Bot/tekrar önleme gerekiyorsa döndürülebilir olmayan, süreli `requestFingerprintHash` tutulur.
- İdempotency anahtarının kendisi değil SHA-256/HMAC benzeri 64 karakterlik özeti tutulur.
- Audit metadata’ya form gövdesi, e-posta, telefon, not, token veya secret yazılmaz.

## Kimlikler, zaman ve bütünlük

- Dışarıdan tahmin edilmemesi için ana kimlikler PostgreSQL UUID’dir.
- Kullanıcıya gösterilen randevu `referenceCode` rastgele üretilir ve benzersizdir; DB kimliği gösterilmez.
- Tüm zamanlar `TIMESTAMPTZ(3)` ile UTC anlamında saklanır. Arayüz `Europe/Istanbul` ile gösterir.
- PostgreSQL `foreignKeys` relation mode kullanılır; kritik ilişkiler DB seviyesinde korunur.
- Admin veya makale gibi denetim geçmişine bağlı kayıtların silinmesi `Restrict`/`SetNull`; alt durum/notification kayıtları talep silinince `Cascade` olur.
- Migration düzeltmeleri yeni ileri migration ile yapılır; uygulanmış migration değiştirilmez.

## İndeks gerekçeleri

- `Article(status, publishedAt DESC)`: yayın listesi ve sitemap.
- `AppointmentRequest(status, createdAt DESC)`: admin iş kuyruğu.
- `AppointmentRequest(retentionExpiresAt)`: saklama süresi temizliği.
- `AppointmentRequest(requestFingerprintHash, fingerprintExpiresAt)`: süreli spam/duplicate kontrolü.
- `AppointmentNotification(status, nextAttemptAt)`: retry işi.
- Foreign key alanlarının tamamı ilişki sorguları için indekslidir.
- `AuditLog` aktör, varlık ve tarih üzerinden araştırılabilir.

## Saklama ve silme

- `retentionExpiresAt`, hukukça onaylanacak süreye göre talep oluşturulurken hesaplanır; şemada sabit varsayılan yoktur.
- Süresi dolan randevu talebi planlı iş ile silinir veya hukuk kararına göre anonimleştirilir. Bağlı durum ve bildirim kayıtları cascade ile kaldırılır.
- Audit log saklama süresi ayrı politikadır; kişisel veri içermeyen olay kaydı mümkün olduğunca iç kimlikle tutulur.
- Yönetici hesabı işten ayrılmada önce pasifleştirilir. İlişkili geçmiş nedeniyle fiziksel silme varsayılan değildir.

## Bağlantı ve ortam yaklaşımı

- Local, test, staging ve production ayrı DB/database veya en az ayrı izole schema/credential kullanır.
- Production uygulama credential’ı en az yetkilidir; migration credential’ı ayrı tutulması tercih edilir.
- Runtime `DATABASE_URL`, pooler gerekiyorsa pooler URL’sidir. CLI migration için isteğe bağlı `DIRECT_DATABASE_URL` önceliklidir.
- Prisma 7 runtime’da `@prisma/adapter-pg` kullanır. Geliştirmede global client cache, hot reload sırasında bağlantı çoğalmasını önler.
- TLS production sağlayıcısında zorunludur; kesin connection string seçilen sağlayıcıya göre belgelenir.

## Migration stratejisi

1. Şema değişikliği yerelde migration olarak üretilir ve SQL incelenir.
2. Boş test DB’ye baştan uygulanır; seed yalnız sahte veridir.
3. Production benzeri veriyle staging provası ve süre/kilit gözlemi yapılır.
4. Geriye uyumlu expand/contract tercih edilir: önce nullable/yeni alan, uygulama geçişi, sonra kısıt/temizlik.
5. Production öncesi doğrulanmış yedek alınır.
6. Uygulama geri alınabiliyorsa DB ileri uyumlu tutulur; yıkıcı DB rollback yerine yeni forward-fix migration tercih edilir.

## Açık kararlar

- PostgreSQL sağlayıcısı, veri bölgesi, pooler ve yedek/PITR planı.
- Randevu talebi ve audit log için hukuk onaylı saklama süreleri.
- Parola tabanlı auth mı, passkey/harici sağlayıcı mı kullanılacağı; `passwordHash` alanı buna göre yeniden değerlendirilecek.
- İç notun gerçekten gerekli olup olmadığı; gerekmiyorsa `operationalNote` kaldırılacak.
- Hizmetlerin admin panelinden yönetilip yönetilmeyeceği; ilk şema yalnız veri kaynağı sağlar.
