# Son Görevler

## 1. Admin hesabı ve MFA

- [x] Production admin hesabını oluştur.
- [x] Güçlü ve benzersiz admin parolası belirle.
- [x] MFA kurulumunu tamamla.
- [x] MFA kurtarma bilgisini güvenli ve çevrimdışı bir yerde sakla.

## 2. Admin paneli testi

- [x] Canlı sitede admin girişini dene.
- [x] Hatalı parola ve hatalı MFA kodunun reddedildiğini kontrol et.
- [x] Admin panelinin yetkisiz ziyaretçilere kapalı olduğunu doğrula.
- [x] Randevu listesinin açıldığını kontrol et.
- [x] Randevu durumunu güncelleme işlemini test et.
- [x] Admin oturumunu güvenli şekilde kapat.

## 3. Resend ve e-posta ayarları

- [x] Resend hesabında gönderici alan adını doğrula.
- [x] Railway'e `RESEND_API_KEY` değişkenini ekle.
- [x] Railway'e `EMAIL_FROM` değişkenini ekle.
- [x] Railway'e `APPOINTMENT_NOTIFICATION_TO` değişkenini ekle.
- [x] Değişken değerlerini kimseyle paylaşma.
- [x] Web servisini yeniden deploy et.

## 4. Canlı randevu testi

- [x] Gerçek olmayan test bilgileriyle randevu talebi gönder.
- [x] Kullanıcıya gizli takip kodu verildiğini kontrol et.
- [x] Kaydın admin panelinde göründüğünü doğrula.
- [x] Ad, e-posta ve telefonun veritabanında şifreli tutulduğunu kontrol et.
- [x] Hizmet ve zaman tercihlerinin doğru göründüğünü kontrol et.
- [x] Bildirim e-postasının ulaştığını doğrula.
- [x] Admin panelinden kesin tarih ve saat önerisi gir.
- [x] Takip koduyla kullanıcı sonuç ekranını kontrol et.
- [x] Test kaydını güvenli şekilde sil.

## 5. Veritabanı yedekleme

- [x] Railway PostgreSQL için otomatik yedeklemeyi aç.
- [x] Yedekleme sıklığını ve saklama süresini belirle.
- [ ] İlk yedeğin başarıyla oluştuğunu kontrol et.
- [ ] Yedekten geri yükleme prosedürünü yaz.
- [ ] Test ortamında geri yükleme denemesi yap.

## 6. Cron ve canlı sistem kontrolü

- [ ] Randevu bildirim cron görevini çalıştır.
- [ ] Gizlilik ve süre dolumu temizleme cron görevini çalıştır.
- [ ] Cron isteklerinin doğru `CRON_SECRET` kullandığını doğrula.
- [ ] Railway loglarında hata bulunmadığını kontrol et.
- [ ] `/api/health` adresinin `200` döndürdüğünü doğrula.
- [ ] Hata durumunda rollback işlemini test et.

## 7. Gerçek içerikler

- [ ] Gerçek biyografi metnini ekle.
- [ ] Eğitim, uzmanlık ve deneyim bilgilerini doğrula.
- [ ] Hizmet adlarını ve açıklamalarını tamamla.
- [ ] Gerçek iletişim bilgilerini ekle.
- [ ] Klinik adresini ve çalışma saatlerini ekle.
- [ ] Kullanım izni bulunan gerçek görselleri ekle.
- [ ] Taslak ve örnek içerikleri kaldır.
- [ ] Mobil ve masaüstü görünümünü kontrol et.

## 8. Hukuk ve KVKK

- [ ] KVKK aydınlatma metnini uzman incelemesinden geçir.
- [ ] Gizlilik politikasını uzman incelemesinden geçir.
- [ ] Çerez politikasını uzman incelemesinden geçir.
- [ ] Açık rıza gereksinimlerini kesinleştir.
- [ ] Veri saklama ve silme sürelerini onaylat.
- [ ] Çocuk, veli ve onam prosedürünü kesinleştir.
- [ ] Form onay kutularının onaylı metinlerle uyumlu olduğunu kontrol et.

## 9. Özel alan adı ve son kontrol

- [ ] Kullanılacak özel alan adını belirle.
- [ ] Alan adını Railway web servisine bağla.
- [ ] DNS kayıtlarını yapılandır.
- [ ] HTTPS sertifikasının aktif olduğunu doğrula.
- [ ] `NEXT_PUBLIC_SITE_URL` değerini özel alan adıyla güncelle.
- [ ] Sitemap, robots.txt ve canonical adreslerini kontrol et.
- [ ] Eski Railway adresinden yönlendirme kararını uygula.
- [ ] Ana sayfa, hizmetler, makaleler, iletişim ve yasal sayfaları test et.
- [ ] Telefon, tablet ve masaüstünde son kullanıcı testini tamamla.
- [ ] Canlıya çıkış onayını ver.
