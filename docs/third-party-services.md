# Üçüncü Taraf Servis Envanteri

Fiyatlar ve kotalar değişebildiğinden rakamlar sağlayıcı seçimi sırasında resmi sayfadan tarih damgasıyla doğrulanacaktır. Doğrulanmamış kota production kapasite varsayımı olarak kullanılmaz.

| İhtiyaç               | Planlanan/seçilecek servis                               | İşlenen veri                                                | Maliyet/kota durumu                                                 | Çıkış / alternatif                                                    | Karar durumu                  |
| --------------------- | -------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------- | ----------------------------- |
| Uygulama barındırma   | Belirlenecek (Vercel vb.)                                | HTTP logları, teknik metadata                               | Teklif öncesi resmi fiyat/kota kaydedilecek                         | Standart Next.js deployment ve container seçeneği değerlendirilecek   | Açık                          |
| PostgreSQL            | Belirlenecek                                             | Kullanıcı/admin ve randevu talebi verileri                  | Depolama, bağlantı, egress, yedek/PITR ayrıca doğrulanacak          | Standart PostgreSQL dump/restore ve Prisma migration                  | Açık                          |
| Transactional e-posta | Resend                                                   | Alıcı/gönderici adresi ve minimize edilmiş bildirim içeriği | Production öncesi gönderim kotası, domain ve fiyat doğrulanacak     | Sağlayıcı bağımsız e-posta servis katmanı                             | Planlandı, sözleşme/kota açık |
| Rate limiting         | Belirlenecek (Redis/KV vb.)                              | Hash/pseudonymous anahtar, sayaç ve süre                    | Request/command, depolama ve egress kotası doğrulanacak             | Değiştirilebilir adapter; uygulama DB'sine bağlanmaması tercih edilir | Açık                          |
| Bot koruması          | Belirlenecek                                             | İstemci teknik sinyalleri ve doğrulama token'ı              | Ücretsiz kota, veri aktarımı ve erişilebilirlik etkisi doğrulanacak | Honeypot + süre kontrolü; gerektiğinde farklı challenge               | Açık                          |
| Görsel depolama/CDN   | Belirlenecek veya repo içi statik                        | Makale/klinik görselleri; kişisel veri olmamalı             | Depolama, dönüşüm ve bandwidth doğrulanacak                         | Orijinal varlıkların taşınabilir yedeği                               | Açık                          |
| Hata izleme           | Belirlenecek                                             | Hata, stack ve filtrelenmiş request metadata                | Event, saklama ve kullanıcı kotası doğrulanacak                     | Yapılandırılmış log + farklı sağlayıcı                                | Açık                          |
| Uptime izleme         | Belirlenecek                                             | URL, yanıt süresi ve durum                                  | Check aralığı ve bildirim kotası doğrulanacak                       | İkinci bağımsız monitor veya hosting monitorü                         | Açık                          |
| Analitik              | Varsayılan olarak eklenmeyecek; iş ihtiyacıyla seçilecek | Consent'e bağlı kullanım verisi                             | Event/retention ve consent maliyeti doğrulanacak                    | Sunucu loglarından mahremiyet odaklı agregasyon                       | Açık                          |

## Servis kabul kontrolü

Her servis production'a eklenmeden önce:

- [ ] Resmi fiyat, ücretsiz kota, aşım ücreti ve doğrulama tarihi kaydedilir.
- [ ] Veri işleme şartları, alt işleyenler, veri bölgesi ve yurt dışı aktarımı hukuk tarafından incelenir.
- [ ] Kullanılan secret, kapsamı, sahibi ve rotasyon prosedürü kaydedilir.
- [ ] Kota ve hata alarmı tanımlanır.
- [ ] Yedekleme/veri dışa aktarma ve sağlayıcıdan çıkış yöntemi denenir.
- [ ] Gizlilik, çerez ve veri envanteri gerekiyorsa güncellenir.

## Aylık maliyet kaydı

| Tarih    | Servis/plan | Doğrulanmış resmi bağlantı | Ücretsiz kota | Tahmini aylık kullanım | Tahmini maliyet | Onaylayan |
| -------- | ----------- | -------------------------- | ------------- | ---------------------- | --------------- | --------- |
| Atanacak | Atanacak    | Atanacak                   | Atanacak      | Atanacak               | Atanacak        | Atanacak  |
