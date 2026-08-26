# Kalan Görevler

Son güncelleme: 27 Ağustos 2026

## Hazır olanlar

- [x] Şifreli randevu, anonim takip ve admin paneli
- [x] PostgreSQL/Prisma ve veri temizleme sistemi
- [x] MFA, güvenlik kontrolleri ve korumalı cron endpoint'leri
- [x] Vercel cron ve production ortam denetimi
- [x] 88 test, 8 Chromium E2E, build ve güvenlik taramaları

## Canlıya alma sırası

### 1. İçerik ve hukuk

- [ ] Gerçek biyografi, hizmet ve iletişim bilgilerini gir
- [ ] Taslak/örnek içerikleri kaldır
- [ ] KVKK, gizlilik, çerez ve saklama sürelerini hukukçuya onaylat
- [ ] Çocuk/veli/onam prosedürünü kesinleştir

### 2. Hesaplar ve hizmetler

- [ ] Vercel Pro projesini oluştur
- [ ] Production PostgreSQL sağlayıcısını seç
- [ ] Resend hesabını ve gönderici alan adını doğrula
- [ ] Alan adını satın al veya mevcut alan adını hazırla
- [ ] Vercel, veritabanı, Resend ve domain hesaplarında MFA aç

### 3. Staging ortamı

- [ ] Vercel Preview ortamını staging olarak yapılandır
- [ ] Ayrı staging PostgreSQL veritabanı oluştur
- [ ] TLS ve minimum yetkili DB kullanıcılarını oluştur
- [ ] Staging secret'larını Vercel'e gir
- [ ] `npm run prisma:migrate:deploy` çalıştır
- [ ] Admin hesabını oluştur ve MFA kur
- [ ] Randevu, takip, admin ve e-posta akışını test et
- [ ] Chrome, Firefox, Safari, Edge, Android ve iPhone testi yap
- [ ] Lighthouse, erişilebilirlik ve SEO kontrolü yap

### 4. Production ortamı

- [ ] Ayrı production PostgreSQL veritabanı oluştur
- [ ] Otomatik yedekleme/PITR ve saklama süresini aç
- [ ] Production secret'larını Vercel'e gir
- [ ] İlk veritabanı yedeğini al
- [ ] Production migration çalıştır
- [ ] Production admin hesabını oluştur ve MFA kur
- [ ] Production deployment yap
- [ ] Alan adı, DNS ve HTTPS bağlantısını tamamla
- [ ] Resend ile gerçek e-posta testi yap
- [ ] Bildirim ve temizlik cron'larının çalıştığını doğrula

### 5. Canlı kabul ve güvenlik

- [ ] Gerçek randevu yaşam döngüsü E2E testi yap
- [ ] Şifreli verinin açık kimlik içermediğini doğrula
- [ ] Sitemap, robots, canonical ve yapılandırılmış veriyi doğrula
- [ ] Production loglarında kişisel veri/secret sızıntısı ara
- [ ] Rate limiting ve bot korumasını kontrol et
- [ ] Bağımsız güvenlik incelemesi yaptır

### 6. Geri alma ve bakım

- [ ] Son sağlam deployment'a rollback testi yap
- [ ] Yedeği izole test veritabanına geri yükle
- [ ] Hata, cron ve e-posta izleme/alarmlarını aç
- [ ] Aylık yedek geri yükleme testi planla
- [ ] Güvenlik güncellemesi ve KVKK silme takvimi oluştur

## Şimdi yapılacak

- [ ] Vercel Pro, PostgreSQL sağlayıcısı, Resend ve alan adı kararlarını ver
