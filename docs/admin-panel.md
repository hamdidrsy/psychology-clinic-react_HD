# Yönetim paneli

## Rotalar ve yetki

- `/admin`: ADMIN ve EDITOR için özet.
- `/admin/makaleler`: ADMIN ve EDITOR için makale yaşam döngüsü.
- `/admin/randevu-talepleri`: yalnız ADMIN için randevu iş kuyruğu ve detay.

Protected layout ilk kapıdır; her sayfa, veritabanı sorgusu ve Server Action ayrıca `requireAdmin()` veya `requireContentManager()` çağırır. Proxy yalnız çerez ön kontrolüdür.

## Makaleler

- Sunucu ve istemci aynı Zod şemasını kullanır.
- İçerik biçimi Markdown’dır. Ham HTML ile `javascript:`/`data:` bağlantıları reddedilir; önizleme React metin düğümleriyle güvenli gösterilir.
- Sayfa H1’i başlıktan üretildiği için editör içeriğinde H1 kullanılmaması istenir.
- Slug başlıktan Türkçe transliterasyonla üretilir ve çakışmada sayısal ek alır. Değişiklikte önceki slug `ArticleSlugRedirect` olarak saklanır.
- Taslak, yayın ve arşiv durumları vardır. Kalıcı silme arayüzü yoktur.
- İlk yayın zamanı korunur; arşiv zamanı ayrıca kaydedilir. Tarihler DB’de UTC, arayüzde Europe/Istanbul gösterilir.
- Görsel yükleme yoktur; yalnız `https`/geçerli URL alanı ve kapak görselinde zorunlu alt metin vardır. Depolama sağlayıcısı seçilmeden dosya kabul edilmez.

## Randevu talepleri

- En yeni kayıtlar önce, 20’şer sayfalı gösterilir.
- Durum, başlangıç/bitiş tarihi ve işlem gereken (`NEW`, `CONTACTED`) filtresi vardır.
- Detay, iletişim bilgileri ve kullanıcının serbest notu yalnız ADMIN tarafından görülür.
- Durum değişikliği açık onay ister; önceki/yeni durum, yönetici, zaman ve veri minimizasyonlu iç not geçmişe eklenir.
- CSV dışa aktarımı ilk sürüm gereksiniminde yoktur. Eklenirse ayrı yetki, sütun minimizasyonu ve formül karakteri kaçış testi zorunludur.

## Saklama süresi

`npm run appointments:purge-expired` varsayılan olarak yalnız sayı raporlar. Kalıcı silme için operasyon onayıyla geçici `CONFIRM_DELETE_EXPIRED_APPOINTMENTS=yes` ayarlanır. İlişkili durum ve bildirim kayıtları cascade ile silinir; toplam sayı/zaman kişisel veri içermeyen audit kaydına yazılır. Production zamanlayıcısı ve hukuk onaylı süre canlıya alma öncesi gereklidir.
