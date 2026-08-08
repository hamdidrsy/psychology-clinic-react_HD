# KVKK veri envanteri ve yaşam döngüsü

- Sürüm: `2026-08-09-v1-draft`
- Durum: teknik envanter; veri sorumlusu kimliği, hukuki sebepler, sağlayıcılar ve süreler hukuk/operasyon onayı bekliyor.
- İlke: amaçla sınırlılık, veri minimizasyonu, süreli saklama, en az yetki ve denetlenebilir silme.

## Veri akışı

```text
Ziyaretçi tarayıcısı
  ├─ public içerik → Next.js uygulaması
  ├─ randevu formu → Server Action → PostgreSQL
  │                                  ├─ randevu + durum geçmişi
  │                                  └─ bildirim kuyruğu → Resend (yalnız yapılandırılırsa)
  └─ zorunlu tercih → yalnız tarayıcı localStorage

Yönetici tarayıcısı → güvenli oturum çerezi → Next.js → PostgreSQL
                                             └─ audit log
```

Analitik, reklam, harita, video embed, CAPTCHA ve kullanıcı teyit e-postası etkin değildir. Bunlardan biri eklenirse envanter, aktarım ve consent değerlendirmesi değişiklikle birlikte yenilenir.

## Veri envanteri

| Veri/varlık              | Kaynak ve amaç                                | Erişim/alıcı                         | Geçici süre ve son işlem                                      | Hukuki durum                                     |
| ------------------------ | --------------------------------------------- | ------------------------------------ | ------------------------------------------------------------- | ------------------------------------------------ |
| Randevu iletişim verisi  | Form; talebe dönüş ve zamanlama               | Yalnız ADMIN; production DB işleyeni | 90 gün; kayıt ve bağlı geçmiş silinir                         | Kesin süre/işleme şartı hukuk onayı bekliyor     |
| Serbest kısa not         | İsteğe bağlı form alanı; talebi anlamlandırma | Yalnız ADMIN; e-postaya eklenmez     | Randevuyla aynı                                               | Özel nitelikli veri istenmez; kullanıcı uyarılır |
| Aydınlatma sürümü/zamanı | Form; hangi metnin gösterildiğini kanıtlama   | ADMIN/denetim                        | Randevuyla aynı                                               | Açık rıza değildir                               |
| Bildirim durumu          | Sistem; Resend teslim/retry takibi            | ADMIN ve yapılandırılırsa Resend     | Randevuyla cascade silme                                      | Provider/bölge/sözleşme bekliyor                 |
| Rate-limit özeti         | Sistem; kötüye kullanım önleme                | Uygulama/DB                          | Pencere bitişinden sonra temizlik                             | Ham IP/iletişim saklanmaz                        |
| Admin hesabı             | Yetkili erişimi                               | ADMIN/altyapı yetkilisi              | İş ilişkisi + hukuki/audit gereği; pasifleştirme              | Kimlik/yetki yönetimi prosedürü geçerli          |
| Admin oturumu            | Giriş; güvenli oturum                         | Tarayıcı ve hash olarak DB           | Çerez en fazla 8 saat; DB kaydı 30 gün sonra temizleme hedefi | Zorunlu güvenlik çerezi                          |
| Audit log                | Giriş, içerik/randevu değişimi, silme         | Yetkili teknik/denetim rolü          | Geçici 365 gün; hukuk ve olay ihtiyacıyla kesinleşecek        | Raw kişisel veri yasak                           |
| Uygulama/hosting logu    | Güvenlik, hata, performans                    | Hosting/operasyon                    | Geçici 30 gün                                                 | Production sağlayıcı ayarı doğrulanmalı          |
| Çerez tercih kaydı       | Tarayıcı; tercihi hatırlama                   | Yalnız aynı tarayıcı                 | Kullanıcı silene veya sürüm değişene kadar                    | localStorage; sunucuya aktarılmaz                |

## Sağlayıcı ve aktarım kaydı

| Sağlayıcı             | Rol/veri                  | Bölge/alt işleyen                    | Durum                                                                           |
| --------------------- | ------------------------- | ------------------------------------ | ------------------------------------------------------------------------------- |
| Yerel PostgreSQL 14   | Development veri tabanı   | Kullanıcının bilgisayarı             | Production sağlayıcısı değildir                                                 |
| Production hosting    | Uygulama ve teknik log    | Belirlenmedi                         | Sözleşme, bölge, log ve silme koşulları açık                                    |
| Production PostgreSQL | Randevu/admin verileri    | Belirlenmedi                         | Türkiye/uygun bölge, DPA, yedek/PITR açık                                       |
| Resend                | Klinik bildirim e-postası | API anahtarı/domain yapılandırılmadı | Etkinleştirme öncesi DPA, bölge, alt işleyen ve aktarım mekanizması incelenecek |

Yurt dışı aktarım kararı sağlayıcı adıyla değil fiilî veri akışı, veri alıcısının rolü/ülkesi ve KVKK 9. maddesindeki güncel mekanizmayla verilir. Standart sözleşme kullanılacaksa doğru taraf tipine ait metin, imzadan itibaren Kuruma bildirim süresi ve ekleri hukuk danışmanıyla yönetilir.

## Silme ve doğrulama

- `npm run appointments:purge-expired` varsayılan dry-run’dır; açık onay olmadan silmez.
- Silme randevu, durum geçmişi ve bildirim kayıtlarını transaction/cascade ile kaldırır; toplam/adım audit loguna kişisel veri olmadan yazılır.
- Yedeklerde silinen kaydın geri dönmesini engelleme süresi production sağlayıcısının yedek saklama politikasına bağlanmalıdır.
- İlgili kişi talebinde referans ve orantılı ikinci kanal doğrulaması yapılmadan erişim kopyası veya silme uygulanmaz.

## Resmî başvuru kaynakları

- KVKK Aydınlatma Yükümlülüğü Tebliği: https://www.kvkk.gov.tr/Icerik/4132/aydinlatma-yukumlulugunun-yerine-getirilmesinde-uyulacak-usul-ve-esaslar-hakkinda-teblig
- KVKK Çerez Uygulamaları Rehberi: https://www.kvkk.gov.tr/Icerik/7353/Cerez-Uygulamalari-Hakkinda-Rehber
- İlgili kişi başvurularının cevaplanması: https://www.kvkk.gov.tr/Icerik/2046/Ilgili-Kisiler-Tarafindan-Yapilan-Basvurularin-Cevaplanmasi-Yukumlulugu
- Yurt dışı aktarım rehberi: https://www.kvkk.gov.tr/Icerik/8142/Kisisel-Verilerin-Yurt-Disina-Aktarilmasi-Rehberi
