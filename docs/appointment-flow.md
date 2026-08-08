# Randevu Talebi ve E-posta Bildirim Akışı

- Durum: Uygulama katmanı hazır; gerçek PostgreSQL, Resend domain ve hukuk onayı bekliyor
- Tarih: 2026-08-08

## Güven sınırı

1. Tarayıcı aynı Zod şemasıyla hızlı kullanıcı geri bildirimi verir.
2. Server Action hiçbir istemci sonucuna güvenmez; FormData’yı aynı şemayla yeniden doğrular.
3. `Origin` ile `x-forwarded-host`/`host` birebir karşılaştırılır. Origin olmayan veya farklı site kaynaklı istek reddedilir.
4. Görünmez honeypot doluysa veri kaydetmeden nötr başarı döner.
5. 1,5 saniyeden hızlı veya 2 saatten eski form oturumu reddedilir.
6. Merkezi PostgreSQL rate limit, normalize edilmiş iletişim bilgisinin HMAC/SHA-256 özeti üzerinden 10 dakikada 5 deneme uygular.
7. `TRUST_PROXY_HEADERS=true` yalnız bilinen hosting/proxy altyapısında açılırsa, adres özeti üzerinden ek 10 dakikada 20 deneme uygulanır. Raw IP saklanmaz.
8. CAPTCHA/Turnstile varsayılan değildir. Spam metriği bu katmanların yetersiz olduğunu gösterirse erişilebilir challenge eklenir ve KVKK/veri aktarımı yeniden incelenir.

## Veri kaydı ve idempotency

- Tarayıcı her form oturumunda UUID idempotency anahtarı üretir; DB’de yalnız SHA-256 özeti saklanır.
- Aynı anahtarla tekrar gönderim yeni talep veya e-posta üretmez, mevcut referansı döndürür.
- Talep, ilk `NEW` durum geçmişi ve `PENDING` bildirim kaydı tek atomik Prisma işlemiyle oluşturulur.
- PostgreSQL `CHECK` constraint’leri en az bir iletişim kanalı ve tercih edilen kanalın bulunmasını ayrıca korur.
- Referans kodu rastgele bileşen içerir; DB UUID’si kullanıcıya gösterilmez.
- Geçici saklama hedefi 90 gündür ve `APPOINTMENT_RETENTION_DAYS` ile yapılandırılır. Production değeri hukuk onayı olmadan kesinleştirilmez.

## E-posta sırası ve hata telafisi

1. Veritabanı kaydı başarıyla tamamlanmadan Resend çağrılmaz.
2. E-posta konusu yalnız talep referansını içerir; serbest not ve sağlık bilgisi e-postaya eklenmez.
3. HTML ve düz metin alternatifleri birlikte gönderilir.
4. Resend çağrısında `appointment-created/<request-id>` idempotency anahtarı kullanılır.
5. Gönderim için 10 saniyelik uygulama timeout’u bulunur.
6. Başarıda provider mesaj kimliği ve `SENT`; hatada güvenli failure code, deneme zamanı ve 5 dakika sonraki `nextAttemptAt` saklanır.
7. `retryPendingAppointmentNotifications`, en fazla 3 denemeye kadar `PENDING/FAILED` kayıtları işler. Production scheduler/cron bağlantısı canlıya hazırlıkta yapılmalıdır.
8. Loglarda yalnız iç request ID ve kısa hata kodu bulunur; form gövdesi, e-posta, telefon veya not loglanmaz.
9. Kullanıcı e-postası ilk sürümde gönderilmez; doğrulanmamış adreslere kişisel veri sızıntısı ve e-posta bombardımanı riski önlenir.

## Production kontrol listesi

- [ ] PostgreSQL sağlayıcısı seçildi ve iki migration test/staging DB’ye uygulandı.
- [ ] `DATABASE_URL` ve gerekiyorsa `DIRECT_DATABASE_URL` tanımlandı.
- [ ] RateLimitBucket üzerinde süresi dolmuş kayıtları temizleyen günlük bakım işi eklendi.
- [ ] Resend’de sahip olunan bir alt alan adı doğrulandı; SPF ve DKIM `verified`.
- [ ] DMARC önce `p=none` izleme ile başlayıp teslimat doğrulandıktan sonra sıkılaştırıldı.
- [ ] `RESEND_API_KEY`, `EMAIL_FROM` ve `APPOINTMENT_NOTIFICATION_TO` secret manager’da tanımlandı.
- [ ] `AUTH_SECRET` en az 32 karakter rastgele değerle tanımlandı; hash’lerde HMAC etkin.
- [ ] `TRUST_PROXY_HEADERS` yalnız hosting’in header’ları temizleyip yeniden yazdığı doğrulandıktan sonra açıldı.
- [ ] `APPOINTMENT_RETENTION_DAYS` hukuk tarafından onaylandı.
- [ ] Retry fonksiyonu korumalı cron/job’a bağlandı; ardışık hata alarmı tanımlandı.
- [ ] Gerçek alıcıyla teslimat, SPF/DKIM/DMARC ve spam klasörü testi yapıldı.
- [ ] Formun geçerli, geçersiz, duplicate, bot, rate limit, DB kesintisi ve Resend kesintisi entegrasyon testleri geçti.
