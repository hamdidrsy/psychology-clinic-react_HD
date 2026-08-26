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

`npm run production:check`, canlı ortam değişkenlerini değerlerini ekrana yazdırmadan denetler. Vercel build’i bu kontrol geçmeden başlamaz.

## Canlı ortam değişkenleri

Tam liste `.env.example` içindedir. Vercel’de Preview ve Production değerlerini ayrı girin; secret’ları repoya veya destek mesajına koymayın.

- `NEXT_PUBLIC_SITE_URL`: HTTPS canonical site adresi.
- `DATABASE_URL`: Uygulamanın kısıtlı yetkili, tercihen pooled PostgreSQL bağlantısı.
- `DIRECT_DATABASE_URL`: Migration kullanıcısının doğrudan bağlantısı; runtime kullanıcısından farklı olmalı.
- `AUTH_SECRET`, `TRACKING_HMAC_KEY_V1`, `CRON_SECRET`: Birbirinden farklı, en az 32 karakterlik secret’lar.
- `MFA_ENCRYPTION_KEY`: Base64URL biçiminde 32 rastgele bayt.
- `RESEND_API_KEY`, `APPOINTMENT_NOTIFICATION_TO`, `EMAIL_FROM`: Doğrulanmış Resend alanına ait değerler.
- `APPOINTMENT_RETENTION_DAYS`, `AUDIT_RETENTION_DAYS`, `ADMIN_SESSION_HOURS`: Onaylanmış saklama/oturum süreleri.
- `TRUST_PROXY_HEADERS=true`: Vercel’de güvenilir proxy başlıklarını kullanmak için.

PowerShell secret örneği:

```powershell
$rng = [Security.Cryptography.RandomNumberGenerator]::Create()
$bytes = New-Object byte[] 48
$rng.GetBytes($bytes)
[Convert]::ToBase64String($bytes)
$rng.Dispose()
```

## Vercel’e alma sırası

1. Git deposunu Vercel Pro projesine bağlayın; Preview ortamını staging olarak kullanın. Bu ticari klinik ve 10 dakikalık bildirim cron’u Hobby sınırlarına uygun değildir.
2. Preview ve Production için ayrılmış PostgreSQL veritabanları oluşturun; TLS zorunlu olsun.
3. Ortam değişkenlerini ilgili Vercel ortamlarına girin.
4. Önce Preview deploy edin; migration için o ortamda `npm run prisma:migrate:deploy` çalıştırın ve kabul testi yapın.
5. Production veritabanının sağlayıcı yedeğini alın, migration’ı uygulayın, sonra production deploy edin.
6. Alan adı/DNS/HTTPS ve Resend domain doğrulamasını tamamlayın; gerçek e-posta ve randevu yaşam döngüsü testi yapın.

`vercel.json`, bildirim tekrarlarını 10 dakikada bir ve veri yaşam döngüsü temizliğini her gün 03:15 UTC’de çalıştırır. On dakikalık sıklık Pro plan gerektirir. Vercel, `CRON_SECRET` değerini Bearer başlığıyla yollar.

## Yedekleme, geri yükleme ve geri alma

- Sağlayıcıda günlük otomatik yedek/PITR açın; saklama süresini KVKK kararına göre belirleyin.
- Ayda bir yedeği yalnız izole test veritabanına geri yükleyip migration ve temel akış testlerini çalıştırın. Canlı veritabanının üzerine deneme geri yüklemesi yapmayın.
- Deploy sorunu varsa Vercel’den son sağlam deployment’a dönün. Migration geriye uyumlu değilse yalnız uygulamayı geri almak yeterli değildir; önce yedekten izole geri yükleme ve veri etkisi değerlendirmesi yapın.
- Her canlı değişiklik öncesinde migration çıktısı, yedek zamanı, sağlam deployment kimliği ve geri alma sorumlusu kaydedilmelidir.

Kalan işler kısa biçimde `yeni_gorev.md` dosyasında takip edilir.
