# Risk Kaydı

Olasılık ve etki 1 (düşük) ile 5 (çok yüksek) arasında puanlanır. Skor = olasılık × etki. 15–25 kritik/yüksek, 8–14 orta, 1–7 düşük kabul edilir.

| ID   | Risk                                                                         | Olasılık | Etki | Skor | Önlem / kontrol                                                                   | Sahip                 | Durum |
| ---- | ---------------------------------------------------------------------------- | -------: | ---: | ---: | --------------------------------------------------------------------------------- | --------------------- | ----- |
| R-01 | Randevu formunda gereksiz veya özel nitelikli kişisel veri toplanması        |        3 |    5 |   15 | Alanları minimize et; sağlık öyküsü isteme; KVKK/hukuk incelemesi yap             | KVKK/hukuk + teknik   | Açık  |
| R-02 | Admin hesabının ele geçirilmesi                                              |        3 |    5 |   15 | Güçlü auth, MFA, rate limit, güvenli oturum, audit log ve kurtarma prosedürü      | Teknik                | Açık  |
| R-03 | Bot/spam nedeniyle DB ve e-posta kotasının tüketilmesi                       |        4 |    4 |   16 | Honeypot, süre kontrolü, merkezi rate limit, gerekirse challenge ve alarm         | Teknik                | Açık  |
| R-04 | Resend arızasında kaydedilmiş talebin fark edilmemesi                        |        3 |    4 |   12 | Önce DB kaydı; e-posta durum kaydı/retry; panel ve alarm ile uzlaştırma           | Teknik + operasyon    | Açık  |
| R-05 | Yanlış veya etik olmayan sağlık/uzmanlık iddiası                             |        3 |    5 |   15 | Kaynak ve unvan doğrulaması; klinik içerik onayı; garanti dilinden kaçınma        | İçerik/klinik         | Açık  |
| R-06 | Migration sırasında veri kaybı veya uzun kesinti                             |        2 |    5 |   10 | Expand/contract, staging provası, doğrulanmış yedek ve rollback runbook           | Teknik                | Açık  |
| R-07 | Log, hata izleme veya e-postada kişisel veri sızıntısı                       |        3 |    5 |   15 | Redaction, veri minimizasyonu, örnek payload testleri ve erişim sınırı            | Teknik + KVKK/hukuk   | Açık  |
| R-08 | Yedeklerin geri yüklenememesi                                                |        2 |    5 |   10 | Otomatik yedek ve periyodik gerçek restore tatbikatı                              | Teknik/operasyon      | Açık  |
| R-09 | Üçüncü taraf servis fiyat/kota değişikliği                                   |        3 |    3 |    9 | Kota alarmı, aylık maliyet incelemesi ve sağlayıcı çıkış planı                    | Proje sahibi + teknik | Açık  |
| R-10 | Düşük mobil performansın SEO ve dönüşümü düşürmesi                           |        3 |    4 |   12 | Performans bütçesi, gerçek cihaz testi, görsel/font ve JS optimizasyonu           | Teknik                | Açık  |
| R-11 | Erişilebilirlik engelleri nedeniyle kullanıcıların formu tamamlayamaması     |        3 |    4 |   12 | WCAG 2.2 AA, klavye/ekran okuyucu testi ve otomatik tarama                        | Teknik + içerik       | Açık  |
| R-12 | Yanlış cookie/analitik uygulamasının izin öncesi veri aktarması              |        3 |    5 |   15 | Varsayılan kapalı; consent öncesi script engeli; hukuk ve teknik test             | KVKK/hukuk + teknik   | Açık  |
| R-13 | Production secret'larının sızması                                            |        2 |    5 |   10 | Secret manager, repo taraması, en az yetki ve rotasyon runbook'u                  | Teknik                | Açık  |
| R-14 | Acil/kriz durumundaki ziyaretçinin randevu formunu acil yardım hattı sanması |        3 |    5 |   15 | Açık kriz uyarısı ve uzman/hukuk onaylı yönlendirme; formun talep olduğunu belirt | Klinik + hukuk        | Açık  |
| R-15 | Tek kişiye bağımlılık nedeniyle yayın veya olay müdahalesinin aksaması       |        4 |    3 |   12 | Runbook, erişim envanteri, yedek sorumlu ve kurtarma bilgileri                    | Proje sahibi          | Açık  |

## Gözden geçirme kuralları

- Her faz çıkışında ve her production yayını öncesinde kayıt gözden geçirilir.
- Yeni riskler yeni satırla eklenir; kapatılan risk silinmez, durumu ve kapanış notu güncellenir.
- Skoru 15 ve üzeri olan risk, kabul eden kişi ve gerekçesi yazılmadan production'a taşınmaz.
- Güvenlik olayı, veri akışı değişikliği veya yeni üçüncü taraf servis sonrası olağan dışı gözden geçirme yapılır.
