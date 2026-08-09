# Psychology Clinic — Kalan Görevler

Son güncelleme: 9 Ağustos 2026

Bu dosya, projeyi güvenli şekilde canlıya almak ve canlı sonrasında işletmek için kalan işleri içerir. Tamamlanan işler `proje_adımları.md` dosyasında takip edilmektedir.

## 1. Öncelikli teknik işler

- [ ] Resend hesabı ve production API anahtarı hazırlanır.
- [ ] Resend gönderici alan adı doğrulanır.
- [ ] `RESEND_API_KEY`, `APPOINTMENT_NOTIFICATION_TO` ve `EMAIL_FROM` production ortamına eklenir.
- [ ] Gerçek bir randevu talebiyle kayıt ve e-posta bildirimi birlikte test edilir.
- [ ] Başarısız e-posta bildirimlerinin yeniden deneme işlemi zamanlanır.
- [ ] Yönetici hesabına uygulama seviyesinde MFA/iki aşamalı doğrulama eklenir.
- [ ] Yönetici ve altyapı sağlayıcısı hesaplarında MFA etkinleştirilir.

## 2. Otomatik testlerin tamamlanması

- [ ] Playwright veya Cypress kurulur.
- [ ] Ana sayfa ve temel navigasyon için E2E testi yazılır.
- [ ] Randevu formunun başarılı ve hatalı gönderim E2E testleri yazılır.
- [ ] Yönetici giriş, çıkış ve başarısız giriş E2E testleri yazılır.
- [ ] Randevu görüntüleme ve durum değiştirme E2E testi yazılır.
- [ ] Makale oluşturma, düzenleme, yayımlama ve arşivleme E2E testi yazılır.
- [ ] Gerçek HTTP ve test PostgreSQL kullanılarak auth/oturum entegrasyon testi tamamlanır.
- [ ] Süresi dolmuş ve iptal edilmiş oturumların korunan sayfalara erişemediği doğrulanır.
- [ ] Production benzeri veri üzerinde migration yükseltme provası yapılır.
- [ ] Boş veritabanından en güncel şemaya migration işlemi staging ortamında doğrulanır.

## 3. Manuel kalite kontrolü

- [ ] Ana sayfa ve tüm navigasyon bağlantıları tek tek kontrol edilir.
- [ ] İletişim ve randevu formu klavyeyle kullanılabilirlik açısından test edilir.
- [ ] Form hata mesajları ekran okuyucuyla kontrol edilir.
- [ ] Yavaş internet ve bağlantı kesintisi senaryoları denenir.
- [ ] Chrome, Firefox, Safari ve Edge üzerinde kontrol yapılır.
- [ ] Gerçek Android ve iPhone cihazlarda kontrol yapılır.
- [ ] Mobil, tablet ve masaüstünde yatay taşma olmadığı doğrulanır.
- [ ] 404, genel hata, boş veri ve çok uzun içerik ekranları kontrol edilir.
- [ ] Türkçe karakter, tarih, saat ve büyük/küçük harf davranışları kontrol edilir.
- [ ] Tüm içerikler yazım, tutarlılık ve etik ifadeler açısından son kez incelenir.

## 4. Erişilebilirlik ve performans

- [ ] axe ile otomatik erişilebilirlik taraması yapılır.
- [ ] Lighthouse erişilebilirlik, SEO ve performans raporları alınır.
- [ ] Başlık sırası, landmark alanları, menü ve form ekran okuyucuyla test edilir.
- [ ] Klavye odağı ve focus sırası uçtan uca kontrol edilir.
- [ ] Sayfalar `%200` ve `%400` yakınlaştırmada test edilir.
- [ ] Performans bütçesi belirlenir ve Lighthouse sonuçlarıyla karşılaştırılır.
- [ ] Bundle analizi yapılır; gereksiz istemci kodu kaldırılır.
- [ ] LCP görselleri, fontlar, cache ve rendering ayarları gözden geçirilir.

## 5. KVKK ve hukuki hazırlık

- [ ] Gerçek veri sorumlusu unvanı ve iletişim bilgileri belirlenir.
- [ ] İlgili kişi başvuru kanalı kesinleştirilir.
- [ ] KVKK, gizlilik ve çerez metinlerindeki taslak bilgiler gerçek bilgilerle değiştirilir.
- [ ] Metinler hukuk danışmanı tarafından incelenir ve onaylanır.
- [ ] Yürürlük tarihleri belirlenir.
- [ ] Hosting, PostgreSQL ve Resend sağlayıcılarının veri işleme koşulları incelenir.
- [ ] Yurt dışı veri aktarımı şartları hukuk danışmanıyla değerlendirilir.
- [ ] Gerekli veri işleyen/alt işleyen sözleşmeleri tamamlanır.
- [ ] Production loglarında kişisel veri, token veya form gövdesi bulunmadığı doğrulanır.

## 6. Canlı altyapı ve güvenlik

- [ ] Production hosting sağlayıcısı seçilir.
- [ ] Production PostgreSQL sağlayıcısı ve bölgesi seçilir.
- [ ] Production veritabanında migration ve uygulama için ayrı kullanıcılar oluşturulur.
- [ ] Uygulama veritabanı kullanıcısına yalnız gerekli izinler verilir.
- [ ] PostgreSQL bağlantısında doğrulamalı TLS zorunlu hâle getirilir.
- [ ] Production ortam değişkenleri güvenli şekilde eklenir.
- [ ] Local, staging ve production anahtarlarının birbirinden farklı olduğu doğrulanır.
- [ ] Güvenlik duyurularını ve Dependabot bildirimlerini takip edecek sorumlu atanır.
- [ ] Gerçek HTTPS adresinde CSP, HSTS ve diğer güvenlik başlıkları test edilir.
- [ ] Hosting log maskeleme ve saklama ayarları kontrol edilir.
- [ ] Git geçmişi ve sağlayıcı loglarında secret taraması yapılır.
- [ ] Bağımsız güvenlik incelemesi veya sızma testi yaptırılır.
- [ ] Kritik ve yüksek önem dereceli güvenlik bulguları kapatılır.

## 7. Yedekleme ve geri alma

- [ ] Otomatik PostgreSQL yedekleme politikası etkinleştirilir.
- [ ] Yedek saklama süresi belirlenir.
- [ ] Yedekten yeni bir veritabanına geri yükleme provası yapılır.
- [ ] Migration öncesi yedek alma prosedürü hazırlanır.
- [ ] Hatalı deployment durumunda önceki sürüme dönüş yöntemi test edilir.
- [ ] Hatalı migration için ileri düzeltme veya geri alma prosedürü yazılır.
- [ ] RTO ve RPO hedefleri belirlenir.

## 8. Staging ve canlıya alma

- [ ] Production'a benzeyen ayrı bir staging ortamı kurulur.
- [ ] Staging ortamında migration, form, e-posta, admin ve makale akışları test edilir.
- [ ] Alan adı ve DNS kayıtları hazırlanır.
- [ ] HTTPS sertifikası doğrulanır.
- [ ] `NEXT_PUBLIC_SITE_URL` gerçek alan adına ayarlanır.
- [ ] Production `robots.txt`, sitemap ve canonical adresleri kontrol edilir.
- [ ] İlk yönetici hesabı güvenli şekilde oluşturulur.
- [ ] Varsayılan veya geçici parolalar kaldırılır.
- [ ] Canlıya alma kontrol listesi ekip tarafından onaylanır.
- [ ] Düşük trafikli bir zaman diliminde production deployment yapılır.
- [ ] Deployment sonrası hızlı sağlık kontrolü gerçekleştirilir.

## 9. Canlı sonrası bakım

- [ ] Uptime ve hata izleme sistemi kurulur.
- [ ] Randevu kayıt ve e-posta başarısızlıkları için alarm oluşturulur.
- [ ] Veritabanı kapasitesi ve yavaş sorgular izlenir.
- [ ] Güvenlik ve bağımlılık güncellemeleri düzenli uygulanır.
- [ ] Süresi dolan randevu ve operasyonel kayıt temizliği zamanlanır.
- [ ] Admin oturum temizliği zamanlanır.
- [ ] Yedekten geri yükleme provası düzenli tekrarlanır.
- [ ] KVKK metinleri ve veri envanteri servis değişikliklerinde güncellenir.
- [ ] Aylık bakım ve üç aylık güvenlik kontrol takvimi oluşturulur.

## Canlıya çıkış için minimum şartlar

- [ ] Gerçek e-posta bildirimi başarıyla çalışıyor.
- [ ] KVKK metinleri ve gerçek iletişim bilgileri onaylandı.
- [ ] Production veritabanı TLS, minimum yetki ve yedeklemeyle hazır.
- [ ] Yönetici ve altyapı hesaplarında MFA açık.
- [ ] Kritik E2E ve manuel cihaz testleri geçti.
- [ ] Kritik/yüksek güvenlik bulgusu kalmadı.
- [ ] Geri alma ve yedekten geri yükleme yöntemleri test edildi.
- [ ] Alan adı, HTTPS, SEO ve production ortam değişkenleri doğrulandı.
