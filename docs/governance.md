# Proje Yönetişimi

Bu belge, Psychology Clinic Hasan Durusoy projesinin karar, geliştirme, kalite ve yayın kurallarını tanımlar.

## Roller ve sorumluluklar

| Rol                           | Sorumluluk                                                                      | Atanan kişi                 |
| ----------------------------- | ------------------------------------------------------------------------------- | --------------------------- |
| Proje sahibi                  | Kapsam, bütçe, öncelik ve production yayını için son karar                      | Atanacak                    |
| Klinik/içerik onay sorumlusu  | Mesleki bilgiler, hizmetler, makaleler ve klinik iletişim dilinin doğruluğu     | Atanacak                    |
| Teknik sorumlu                | Mimari, uygulama, veritabanı, güvenlik, test ve teknik yayın hazırlığı          | Atanacak                    |
| KVKK/hukuk onay sorumlusu     | Aydınlatma, gizlilik, çerez, açık rıza ve veri işleme süreçlerinin hukuki onayı | Atanacak                    |
| Production yayın onaylayıcısı | Kabul kriterleri sağlandığında go/no-go kararı                                  | Proje sahibi; kişi atanacak |

Bir kişi birden fazla rol üstlenebilir; ancak kendi geliştirdiği kritik değişikliğin test sonucunu tek başına onaylamamalıdır. Production yayını, teknik doğrulama ve proje sahibi onayının ikisini de gerektirir. KVKK metinleri hukuk onayı olmadan tamamlandı sayılmaz.

## İletişim ve görev takibi

- Ana görev kaydı: Git sağlayıcısının issue sistemi. Sağlayıcı seçilene kadar `proje_adımları.md` ana takip kaydıdır.
- Kararlar: `docs/decisions` altındaki ADR kayıtları.
- Günlük teknik notlar: ilgili issue veya pull request üzerinde.
- Kapsam/onay kararları: yazılı kayda bağlanır; yalnız sözlü karar tamamlanmış kabul edilmez.
- Güvenlik veya kişisel veri olayı: normal görev kuyruğundan ayrılır ve proje sahibi ile teknik sorumluya doğrudan bildirilir.

### Hata öncelikleri

| Seviye      | Tanım                                                                                    | İlk hedef                                            |
| ----------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| P0 — Kritik | Veri sızıntısı/kaybı, admin hesabının ele geçirilmesi veya sitenin tamamen erişilememesi | Derhal müdahale; gerekirse sistemi güvenli duruma al |
| P1 — Yüksek | Randevu kaydı, admin giriş veya yayınlama gibi kritik akışın çalışmaması                 | Aynı iş günü içinde değerlendir                      |
| P2 — Orta   | Alternatifi bulunan işlev hatası, önemli erişilebilirlik veya görünüm sorunu             | Yakın sürüme planla                                  |
| P3 — Düşük  | Küçük görsel/metinsel kusur veya iyileştirme                                             | Backlog'a al ve önceliklendir                        |

P0 ve P1 süreleri operasyon kapasitesi netleşince sayısal SLA/SLO olarak güncellenecektir.

## Ortamlar

| Ortam             | Amaç                                                        | Veri ve erişim kuralı                                             |
| ----------------- | ----------------------------------------------------------- | ----------------------------------------------------------------- |
| Local/development | Geliştirme ve hızlı test                                    | Yalnız sahte veri; geliştiriciye özel secret                      |
| Test/CI           | Otomatik testler                                            | Her çalışmada izole/geçici test verisi; production secret yok     |
| Preview           | Pull request ve kabul öncesi görsel kontrol                 | Sahte veri; `noindex`; mümkünse erişim korumalı                   |
| Staging           | Production benzeri entegrasyon, migration ve rollback testi | Production'dan ayrı DB/secret; kişisel veri varsayılan olarak yok |
| Production        | Canlı site ve gerçek randevu talepleri                      | En az yetki, MFA, şifreli bağlantı, yedekleme ve izleme           |

Production verisi development veya preview ortamına kopyalanmaz. Zorunlu bir hata incelemesinde veri önce anonimleştirilir ve işlem kayıt altına alınır.

## Git ve değişiklik akışı

- Varsayılan dal `main` olur ve her zaman yayınlanabilir tutulur.
- İş dalları kısa ömürlüdür: `feat/`, `fix/`, `docs/`, `chore/` ve `security/` önekleri kullanılır.
- Commit mesajları kısa, emir kipinde ve tek mantıksal değişikliği anlatacak biçimde yazılır.
- Doğrudan `main` üzerinde özellik geliştirilmez; pull request açılır.
- PR açıklaması amaç, kapsam, test kanıtı, ekran değişikliği ve varsa migration/rollback etkisini içerir.
- Merge için lint, typecheck, test ve production build kontrolleri geçmelidir.
- Kritik auth, kişisel veri, migration ve altyapı değişiklikleri en az bir bağımsız teknik inceleme gerektirir.
- Tercih edilen birleştirme yöntemi squash merge'dür. Sürüm yayınları etiketlenir ve release notu tutulur.
- Secret, gerçek hasta/danışan verisi veya production export'u hiçbir dalda commit edilemez.

## Onay ayrımı

1. Geliştirici değişikliği ve otomatik testleri hazırlar.
2. Teknik inceleyen kişi kod, güvenlik, veri ve geri alma etkisini inceler.
3. İçerik etkisi varsa klinik/içerik sorumlusu metni onaylar.
4. KVKK/veri işleme etkisi varsa hukuk sorumlusu onaylar.
5. Teknik sorumlu staging kabulünü tamamlar.
6. Proje sahibi veya yazılı olarak yetkilendirdiği kişi production go/no-go kararını verir.

Ekip tek kişiden oluşuyorsa bağımsız inceleme yapılamadığı açıkça kaydedilir; kritik değişikliklerde ikinci bir göz veya dış denetim yayın öncesinde aranır.

## Tamamlandı tanımı

Bir iş ancak aşağıdakilerin uygulanabilir olanlarının tamamı sağlandığında “tamamlandı” sayılır:

- Kabul kriterleri karşılanmış ve kapsam dışı davranış yaratılmamıştır.
- TypeScript, lint ve production build hatasızdır.
- Riskle orantılı unit, integration ve/veya E2E testleri eklenmiş ve geçmiştir.
- Mobil görünüm, klavye kullanımı ve WCAG 2.2 AA kontrolleri yapılmıştır.
- Güvenlik, yetkilendirme, girdi doğrulama, kişisel veri ve log etkileri incelenmiştir.
- Indexlenebilir sayfalarda metadata, canonical, yapılandırılmış veri ve iç link etkisi değerlendirilmiştir.
- Kullanıcıya dönük metin ve mesleki iddialar içerik sorumlusu tarafından onaylanmıştır.
- KVKK veya çerez etkisi varsa hukuk/veri envanteri güncellenmiştir.
- Gerekli dokümantasyon, `.env.example`, migration ve rollback notları güncellenmiştir.
- Preview/staging kabulü yapılmış ve gerekli onaylar yazılıdır.

## Karar ve değişiklik yönetimi

Mimari, güvenlik, veri modeli, sağlayıcı veya geri dönüşü maliyetli kararlar ADR ile kaydedilir. ADR numaraları sıralı gider; kabul edilmiş kayıt sessizce değiştirilmez. Yeni bilgi eski kararı geçersiz kılarsa yeni ADR eski kaydı “yerine geçen” bağlantısıyla günceller.

Bu belgenin sahibi teknik sorumludur. Roller, ortamlar veya onay akışı değiştiğinde aynı pull request içinde güncellenir.
