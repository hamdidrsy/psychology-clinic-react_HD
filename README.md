# Psychology Clinic Hasan Durusoy

Next.js, TypeScript, Tailwind CSS, PostgreSQL/Prisma ve Resend tabanlı psikolog kliniği sitesi. Randevu kimliği tarayıcıda şifrelenir; sunucu ve veritabanı yalnız şifreli içeriği alır. Yönetim panelinde MFA, takip kodu, bildirim kuyruğu, saklama süresi temizliği ve denetim kayıtları bulunur.

## Yerel çalıştırma

Gereksinimler: Node.js `22.20.0`, npm `>=10.9 <12` ve PostgreSQL 14+.

```powershell
npm.cmd ci
Copy-Item .env.example .env.local
npm.cmd run prisma:migrate:deploy
npm.cmd run dev
```

Site: `http://localhost:3000` — yönetici girişi: `http://localhost:3000/admin/giris`

İlk yönetici hesabı ve MFA kurulumu:

```powershell
npm.cmd run admin:create
npm.cmd run admin:mfa:setup
```

## Temel kontroller

```powershell
npm.cmd run check
npm.cmd run test:e2e -- --project=chromium
npm.cmd run audit
npm.cmd run security:secrets
```

`npm run production:check`, canlı ortam değişkenlerini değerlerini ekrana yazdırmadan denetler. Railway build komutu bu kontrolü build’den önce çalıştırmalıdır.

## Canlı ortam değişkenleri

Tam liste `.env.example` içindedir. Railway’de Staging ve Production değerlerini ayrı girin; secret’ları repoya veya destek mesajına koymayın.

- `NEXT_PUBLIC_SITE_URL`: HTTPS canonical site adresi.
- `DATABASE_URL`: Uygulamanın kısıtlı yetkili, tercihen pooled PostgreSQL bağlantısı.
- `DIRECT_DATABASE_URL`: Migration kullanıcısının doğrudan bağlantısı; runtime kullanıcısından farklı olmalı.
- `AUTH_SECRET`, `TRACKING_HMAC_KEY_V1`, `CRON_SECRET`: Birbirinden farklı, en az 32 karakterlik secret’lar.
- `MFA_ENCRYPTION_KEY`: Base64URL biçiminde 32 rastgele bayt.
- `RESEND_API_KEY`, `APPOINTMENT_NOTIFICATION_TO`, `EMAIL_FROM`: Doğrulanmış Resend alanına ait değerler.
- `APPOINTMENT_RETENTION_DAYS`, `AUDIT_RETENTION_DAYS`, `ADMIN_SESSION_HOURS`: Onaylanmış saklama/oturum süreleri.
- `TRUST_PROXY_HEADERS=true`: Railway’in güvenilir proxy başlıklarını kullanmak için.

PowerShell secret örneği:

```powershell
$rng = [Security.Cryptography.RandomNumberGenerator]::Create()
$bytes = New-Object byte[] 48
$rng.GetBytes($bytes)
[Convert]::ToBase64String($bytes)
$rng.Dispose()
```

## Railway’e alma sırası

1. Railway projesi oluşturup GitHub deposunu web servisine bağlayın.
2. Aynı projeye PostgreSQL ekleyin; web servisindeki `DATABASE_URL` ve migration bağlantısını referans değişkenlerle ayarlayın.
3. Web servisinin Build Command alanına `npm run production:check && npm run build`, Pre-deploy Command alanına `npm run prisma:migrate:deploy`, Start Command alanına `npm run start` yazın.
4. Healthcheck Path değerini `/api/health`, restart politikasını `ON_FAILURE` ve drain süresini en az 15 saniye yapın.
5. Ortam değişkenlerini girip önce staging, ardından production deploy edin.
6. Aynı GitHub deposundan `appointment-notifications` adlı cron servisi oluşturun. Start Command: `npm run cron:notifications`; Cron Schedule: `*/10 * * * *`.
7. Aynı depodan `privacy-cleanup` adlı ikinci cron servisi oluşturun. Start Command: `npm run cron:privacy-cleanup`; Cron Schedule: `15 3 * * *`.
8. İki cron servisine web servisinin HTTPS adresini `APP_URL`, aynı gizli değeri `CRON_SECRET` olarak girin. Cron servislerine public domain vermeyin.
9. Alan adı/DNS/HTTPS ve Resend doğrulamasını tamamlayıp gerçek e-posta ve randevu yaşam döngüsü testi yapın.

Railway cron zamanları UTC’dir. Cron betikleri korumalı endpoint’i çağırır, sonucu kontrol eder ve işlem tamamlanınca kapanır.

## Yedekleme, geri yükleme ve geri alma

- Sağlayıcıda günlük otomatik yedek/PITR açın; saklama süresini KVKK kararına göre belirleyin.
- Ayda bir yedeği yalnız izole test veritabanına geri yükleyip migration ve temel akış testlerini çalıştırın. Canlı veritabanının üzerine deneme geri yüklemesi yapmayın.
- Deploy sorunu varsa Railway’den son sağlam deployment’ı yeniden deploy edin. Migration geriye uyumlu değilse yalnız uygulamayı geri almak yeterli değildir; önce yedekten izole geri yükleme ve veri etkisi değerlendirmesi yapın.
- Her canlı değişiklik öncesinde migration çıktısı, yedek zamanı, sağlam deployment kimliği ve geri alma sorumlusu kaydedilmelidir.

Kalan işler kısa biçimde `yeni_gorev.md` dosyasında takip edilir.
