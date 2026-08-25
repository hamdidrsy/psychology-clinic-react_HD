# Psychology Clinic — Kalan Görevler

Son güncelleme: 24 Ağustos 2026

Bu dosya, projeyi güvenli şekilde canlıya almak ve canlı sonrasında işletmek için kalan işleri içerir. Gizlilik mimarisi tamamlanmadan randevu sistemi production ortamına açılmamalıdır.

## Güncel durum ve buradan devam sırası

Bulunduğumuz aşama: **Şifreli randevu mimarisi ve temel anonim akış tamamlandı; şimdi production öncesi doğrulama ve güvenlik sağlamlaştırması aşamasındayız.** Form tarayıcıda şifreleme yapıyor, PostgreSQL plaintext kimlik alanı tutmuyor, kullanıcı gizli belgeyle durum görebiliyor/iptal edebiliyor, admin kimliği açmadan karar ve zaman önerisi girebiliyor, yüz yüze çözme yalnız tarayıcıda gerçekleşiyor. Son kontrolde 76 birim/entegrasyon testi ve 7 Chromium E2E testi geçti; lint, TypeScript, production build, secret taraması ve npm audit temiz.

Kalan işleri aşağıdaki sırayla ele alacağız:

1. **P0 — Yerel uçtan uca randevu provası:** `TRACKING_HMAC_KEY_V1` tanımlandı; gerçek PostgreSQL üzerinde şifreli oluşturma, takip, admin onayı, önerilen zaman, iptal ve yüz yüze çözme Chromium E2E senaryoları geçti.
2. **P0 — Gizlilik E2E testleri:** Playwright kuruldu; HTTP isteği, tarayıcı depoları, PostgreSQL ve gerçek Next.js stdout/stderr çıktısı plaintext/anahtar sızıntısına karşı otomatik taranıyor. Yanlış anahtar, bozuk paket, replay, XSS ve çevrimdışı retry senaryoları test edildi; POST başladıktan sonraki bağlantı kopması için güvenli retry tasarımı açık.
3. **P0 — Yönetici güvenliği:** Randevu açma yetkisi rol bazında sınırlandırılacak, açma olayı içeriksiz audit edilecek, MFA ve oturum iptali production şartı hâline getirilecek.
4. **P0 — Veri yaşam döngüsü:** Reddedilen/iptal edilen/süresi dolan kayıtların otomatik temizliği, anonim silme talebi, yedek saklama süresi ve geri yükleme/geri alma provası tamamlanacak.
5. **P0 — Gerçek e-posta provası:** Resend hesabı ve doğrulanmış gönderici alan adı hazırlanacak; production değişkenleri eklenip yalnız anonim yönetici bildiriminin gönderildiği doğrulanacak.
6. **P0 — Hukuk ve klinik prosedürü:** Çocuk/ergen ve veli/onam akışı, KVKK metinleri, gerçek veri sorumlusu bilgileri, yurt dışı aktarım ve fiziksel klinik kayıt prosedürü hukuk danışmanıyla kesinleştirilecek.
7. **P1 — Tarayıcı, erişilebilirlik ve performans:** Chrome, Firefox, Safari, Edge, Android ve iPhone testleri; ekran okuyucu/klavye kontrolleri; Lighthouse, axe ve bundle incelemesi yapılacak.
8. **P1 — Staging ve canlıya alma:** Hosting/PostgreSQL seçilecek; minimum yetki, TLS, farklı ortam anahtarları, staging migration, yedek geri yükleme, alan adı/HTTPS/SEO ve rollback kontrolleri tamamlanacak.
9. **P2 — Canlı sonrası işletim:** İzleme/alarmlar, zamanlanmış temizlikler, bağımlılık güncellemeleri, periyodik erişim kontrolü ve yıllık kriptografi incelemesi planlanacak.

Bir sonraki uygulanacak iş: **2. adımın devamı — POST başladıktan sonra bağlantı kopması için anahtarı kalıcı tarayıcı depolarına yazmadan güvenli ve idempotent retry tasarımı.** Gerçek test sunucusu stdout/stderr sızıntı taraması tamamlandı. Dış uzman ve hukuk onayı gerektiren maddeler teknik çalışmayı engellemez ancak production açılışını engeller. Aşağıdaki ayrıntılı listeler kanıt oluştukça tek tek işaretlenecektir.

## 0. Gizlilik Öncelik Planı — Şifreli ve Kimlik Gizleyen Randevu Sistemi

### P0 başlangıç denetimi — mevcut sistem

Denetim tarihi: 9 Ağustos 2026

Durum: **Mevcut randevu akışı yeni gizlilik hedefini karşılamıyor ve bu hâliyle production'a açılmamalıdır.** Bu tespit bir veri ihlali olduğu anlamına gelmez; yerel geliştirme sürümünün hedef mimariye henüz dönüştürülmediğini gösterir.

| Alan             | Mevcut davranış                                              | Hedefle farkı                                            | Öncelik            |
| ---------------- | ------------------------------------------------------------ | -------------------------------------------------------- | ------------------ |
| Form             | Ad, e-posta/telefon ve serbest not topluyor                  | Açık değerler tarayıcıdan Server Action'a gidiyor        | P0-bloklayıcı      |
| Server Action    | Açık alanları Zod ile doğrulayıp işliyor                     | Sunucu hassas veriyi görebiliyor                         | P0-bloklayıcı      |
| PostgreSQL       | `fullName`, `email`, `phone`, `note` plaintext kolonları var | Veritabanı kimliği doğrudan okuyabiliyor                 | P0-bloklayıcı      |
| Admin listesi    | Ad ve iletişim kanalı gösteriliyor                           | Yönetici kişiyi randevu öncesinde tanıyor                | P0-bloklayıcı      |
| Admin detay      | Ad, e-posta, telefon ve not gösteriliyor                     | Kullanıcı anahtarı olmadan açık veri erişilebilir        | P0-bloklayıcı      |
| Resend           | Ad ve iletişim bilgisini e-postaya koyuyor                   | Üçüncü taraf açık kişisel veri alıyor                    | P0-bloklayıcı      |
| Durum akışı      | `NEW`, `CONTACTED`, `SCHEDULED` vb. kullanıyor               | Anonim takip/önerilen kesin zaman alanı yok              | P0-bloklayıcı      |
| Kullanıcı takibi | Yalnız referans kodu gösteriliyor                            | Gizli takip sırrı ve durum sayfası yok                   | P0-bloklayıcı      |
| Rate limit       | E-posta/telefon HMAC özeti ve geçici IP özeti kullanıyor     | Kimlikler arası ilişkilendirme riski doğuruyor           | P0-yeniden tasarım |
| Idempotency      | Tarayıcı UUID'sinin SHA-256 özeti tutuluyor                  | Temel yaklaşım kullanılabilir; takip sırrından ayrılmalı | P1-uyarlama        |
| Loglar           | Form gövdesi loglanmıyor; bazı hata kodları yazılıyor        | Yeni payload ve anahtar için negatif test gerekli        | P1-doğrulama       |
| Saklama          | Randevu için süre sonu ve silme script'i var                 | Ciphertext, takip hash'i ve yedek kapsamı uyarlanmalı    | P2-uyarlama        |
| Testler          | Eski plaintext akışı 58 testle doğrulanıyor                  | Test fixture ve beklentileri yeni modele geçirilmeli     | P1-yeniden yazım   |

### Önerilen P0 karar kaydı

Bu tablo uygulama başlamadan önce sabitlenecek mimari sözleşmedir. `Önerildi` durumundaki kararlar işletme sahibi tarafından onaylanmadan kriptografi/veri migration kodu yazılmayacaktır.

| No     | Karar                      | Önerilen güvenli varsayılan                                                                                                     | Durum                                                 |
| ------ | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| P0-K01 | Kimlik gizliliğinin sınırı | Sunucu, DB, Resend ve admin kullanıcı anahtarı olmadan kimliği çözemesin                                                        | Kullanıcı hedefiyle doğrulandı                        |
| P0-K02 | Şifreli alanlar            | Ad-soyad, e-posta ve telefon tek sürümlü şifreli paket içinde olsun                                                             | İşletme sahibi onayladı                               |
| P0-K03 | Açık alanlar               | Yalnız hizmet kategorisi, geniş zaman tercihi, oluşturulma zamanı, anonim kod ve durum açık olsun                               | İşletme sahibi onayladı                               |
| P0-K04 | Serbest not                | İlk sürümde tamamen kaldırılsın; gerekli olursa sonraki sürümde şifreli ve kısa olarak eklensin                                 | İşletme sahibi onayladı                               |
| P0-K05 | Kullanıcıyla iletişim      | Telefon/e-posta kullanılmasın; kullanıcı gizli takip koduyla sonucu kendisi kontrol etsin                                       | İşletme sahibi onayladı                               |
| P0-K06 | Kesin zaman bildirimi      | Admin açık bir `önerilenRandevuZamanı` girsin; kullanıcı bunu takip ekranında görsün                                            | İşletme sahibi onayladı                               |
| P0-K07 | E-posta                    | Resend yalnız kliniğe “yeni anonim talep” bildirimi göndersin; kimlik/ciphertext/takip sırrı içermesin                          | Onaylanan modelin zorunlu teknik sonucu               |
| P0-K08 | Anahtar sahipliği          | Çözme anahtarı yalnız kullanıcıda olsun; sunucuda kurtarma kopyası bulunmasın                                                   | Kullanıcı hedefiyle doğrulandı                        |
| P0-K09 | Kayıp anahtar              | Kullanıcıya indirilebilir/yazdırılabilir ikinci kopya verilsin; klinik yedek tutmasın; iki kopya da kaybolursa kurtarma olmasın | Güvenli varsayılan kabul edildi                       |
| P0-K10 | Yüz yüze açma              | Kullanıcı QR/kodu klinik cihazına girer; decrypt yalnız o tarayıcının belleğinde yapılır                                        | Kullanıcı hedefiyle doğrulandı                        |
| P0-K11 | Açılan veri                | Uygulamaya geri yazılmasın; yüz yüze sonrası gerekli bilgiler ayrı fiziksel klinik kaydına alınabilsin                          | İşletme sahibi onayladı; prosedür/hukuk açık          |
| P0-K12 | Başvuru durumu             | `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`, `EXPIRED`, `COMPLETED` anonim akışına geçilsin                                  | Onaylanan takip modelinin zorunlu teknik sonucu       |
| P0-K13 | Takip kimliği              | Public başvuru kodundan ayrı, yüksek entropili takip sırrı olsun; DB yalnız hash'ini saklasın                                   | İşletme sahibi onayladı                               |
| P0-K14 | Yaş kapsamı                | Yaş sınırı uygulanmasın ve doğum tarihi toplanmasın; çocuk/veli hukuki-operasyonel akışı ayrıca netleştirilsin                  | İşletme sahibi yaş sınırı istemedi; hukuk kararı açık |
| P0-K15 | Acil durum                 | Form ve takip ekranı acil durum/kriz kanalı olmadığını, acil tehlikede 112 veya en yakın acil servisin kullanılacağını söylesin | Güvenli varsayılan kabul edildi                       |
| P0-K16 | Mevcut yerel kayıtlar      | Gerçek kişi verisi varsa migration yapılmadan önce ayrı değerlendirme; test verisiyse onayla güvenli silme                      | Test kaydı onayla silindi; denetimde toplam 0         |
| P0-K17 | Production kapısı          | Tüm P0 kararları, testleri, bağımsız güvenlik incelemesi ve hukuk onayı tamamlanmadan form production'a açılmasın               | İşletme sahibi onayladı                               |

### Kararların teknik sonuçları

- Mevcut form, Server Action, Prisma modeli, admin liste/detay ekranı, durum akışı, e-posta şablonu ve ilgili testler değişecektir.
- Kullanıcıya telefon veya e-postayla dönüş yapılmayacaktır; bu bilgi şifreli pakette bulunsa bile randevu öncesinde klinik tarafından kullanılamaz.
- Admin talebi değerlendirirken kimlik yerine hizmet ve geniş zaman tercihini görecektir.
- Onay sırasında admin kesin bir tarih/saat önerecek; kullanıcı gizli takip ekranında onay sonucunu görecektir.
- Yüz yüze gelmeden önce kimliği açmama hedefi korunacaktır; klinik yedek anahtar isterse bunun teknik değil prosedürel bir sınıra dönüşeceği kabul edilmelidir.
- Kullanıcı anahtarını kaybederse kurtarma davranışı, yedek anahtarın kimde tutulacağı kararıyla birlikte kesinleşecektir.
- Yüz yüze açılan bilgiler uygulamaya geri yazılmayacak; gerekli klinik notlar ayrı fiziksel hasta kaydına alınacaktır. Fiziksel kayıt kilitli saklama, sınırlı erişim, saklama süresi ve güvenli imha prosedürüne tabi olacaktır.
- Şifreleme anahtarı ile durum takip sırrı farklı değerler olacaktır; birinin paylaşılması diğer işlevi otomatik olarak açmayacaktır.
- Mevcut `CONTACTED` durumu anonim modelde anlamını kaybettiği için kaldırılacak veya kullanılmayacaktır.

### P0 karar aşaması kabul kapısı

- [x] Mevcut plaintext veri akışı kod, şema, panel, e-posta, log, saklama ve test katmanlarında incelendi.
- [x] Yeni hedefle çelişen bloklayıcı noktalar kaydedildi.
- [x] Güvenli varsayılan mimari kararları ve teknik sonuçları yazıldı.
- [x] P0-K02–K07 ve P0-K12–K14 için işletme kararı alındı. — Yaş sınırı yok; çocuk/veli hukuk akışı ayrıca açık.
- [x] P0-K11 ve P0-K17 için işletme kararı alındı. — Uygulamaya açık veri yazılmayacak; yüz yüze sonrası ayrı fiziksel klinik kaydı kullanılabilecek; production kapısı kabul edildi.
- [x] P0-K09 için yedek anahtarın sahibi ve saklama yöntemi kesinleştirildi. — İki kopya kullanıcıya verilecek; klinikte anahtar/yedek olmayacak.
- [x] P0-K15 acil durum yönlendirmesi güvenli varsayılan olarak kabul edildi. — Form/takip ekranı 112 ve en yakın acil servise yönlendirecek.
- [x] Yerel veritabanı yalnız sayısal/metadata sorgusuyla denetlendi. — Tek test kaydı açık onayla silindi; tekrar denetimde toplam ve tüm plaintext alan sayıları `0`.
- [ ] Hukuk danışmanına sunulacak karar özeti onaylandı.
- [x] Kararlar sabitlendikten sonra P0 tehdit modeli aşamasına geçiş onayı verildi ve çalışma tamamlandı.

### Hedef gizlilik seviyesi

Amaç, ziyaretçinin hassas bilgilerini kendi tarayıcısında şifrelemek; sunucuya, veritabanına, hosting loglarına, e-posta sağlayıcısına ve yönetici paneline hiçbir zaman açık hâliyle göndermemektir. Yönetici talebi kişinin kimliğini öğrenmeden değerlendirecek; kimlik ancak kişi kendi çözme anahtarını yüz yüze görüşmede gönüllü olarak sunduğunda açılabilecektir.

Bu model yalnız “veritabanı diski şifreli” veya “panelde yıldızlı gösterim” değildir. Uygulama sunucusunun çözme anahtarına sahip olmadığı, kullanıcı kontrollü istemci tarafı şifreleme hedeflenmektedir.

### P0 — Canlıya çıkmadan önce zorunlu kararlar

- [x] Sistemin güvenlik hedefi yazılı olarak onaylanır: sunucu, veritabanı yöneticisi ve klinik yöneticisi randevu öncesinde kimlik alanlarını çözemeyecek.
- [x] Kimliği gizlenecek alanlar kesinleştirilir: ad-soyad, e-posta, telefon ve kimliği ortaya çıkarabilecek diğer bilgiler.
- [x] Yönetici karar verebilsin diye açık kalacak en az veri kesinleştirilir: hizmet kategorisi, tercih edilen zaman aralığı, oluşturulma zamanı, anonim başvuru kodu ve durum.
- [x] Hizmet ve zaman bilgisinin bile kişiyi tanımlayabileceği uç durumlar risk kaydına eklenir. — Nadir hizmet, dar zaman aralığı ve oluşturulma zamanı başka bilgilerle birleştirilirse kişiyi ayırt edebilir; admin ekranında yalnız operasyon için gereken hassasiyet gösterilecek.
- [x] Serbest not alanının tamamen kaldırılması veya şifreli tutulması kararlaştırılır. — İlk sürümde kaldırılacak.
- [x] Telefon/e-posta görünmeden kişiye nasıl dönüş yapılacağı kesinleştirilir: kullanıcı gizli takip koduyla siteden sonucu kontrol edecek.
- [x] Resend ile kullanıcıya doğrudan bildirim gönderilemeyeceği kabul edilir; yalnız kimlik içermeyen yönetici bildirimi gönderilebilir.
- [x] Kullanıcının iki anahtar kopyasını da kaybetmesi durumunda verinin kurtarılamayacağı açıkça kabul edilir. — Klinik yedek tutmayacak; kullanıcı yeni anonim başvuru oluşturacak.
- [x] Klinik çalışanının anahtarı kullanıcıdan telefon, e-posta veya mesajla istememesi kuralı belirlenir. — Anahtar yalnız yüz yüze, kullanıcının gönüllü sunumuyla kullanılacak.
- [x] Yüz yüze çözme işleminin gerçekten gerekli olup olmadığı değerlendirilir. — İşletme hedefi yüz yüze tanımayı gerektiriyor; ilk sürümde yalnız ad/e-posta/telefon şifreli toplanacak, serbest not hiç toplanmayacak.
- [ ] Çocuk/ergen başvuruları, veli bilgisi ve acil durumlar için ayrı hukuki ve operasyonel akış belirlenir. — İşletme sahibi yaş sınırı istemiyor ve doğum tarihi toplanmayacak; yasal temsilci/onam süreci hukuk ve mesleki uygulama görüşüyle production öncesi kesinleşecek.
- [x] Bu sistemin acil destek kanalı olmadığı formda ve takip ekranında açıkça gösterilir. — Acil tehlikede 112 veya en yakın acil servise başvuru metni kullanılacak.
- [ ] Mimari, uygulamaya geçmeden önce bağımsız bir uygulama güvenliği uzmanına inceletilir.

Karar aşaması özeti: **11/13 madde karara bağlandı.** Çocuk/ergen hukuki-operasyonel akışı ile bağımsız uzman incelemesi dış doğrulama gerektirdiğinden açık production kapısıdır. Teknik tehdit modelleme ve prototip çalışması başlayabilir; gerçek kullanıcıya açılış yapılamaz.

### P0 — Tehdit modeli ve veri sınıflandırması

#### Veri sınıflandırma standardı

| Sınıf                 | Tanım                                                              | Bu projedeki örnekler                                                                                                                                      | Temel kural                                                                                                                        |
| --------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| G4 — Kritik sır       | Açığa çıkarsa doğrudan kimlik çözme veya hesap ele geçirme sağlar  | AES çözme anahtarı, takip sırrının açık hâli, admin session token, `AUTH_SECRET`, DB/Resend parolaları                                                     | Sunucuya gerekmiyorsa hiç gönderilmez; loglanmaz; URL/cookie/localStorage'a yazılmaz; en kısa süre bellekte tutulur                |
| G3 — Çok hassas       | Tek başına veya başka veriyle kişiyi/başvuruyu ortaya çıkarabilir  | Şifreleme öncesi ad/e-posta/telefon, ciphertext, IV, authentication tag, fiziksel klinik notu                                                              | Erişim en az yetki; uygulamada plaintext yalnız kullanıcı tarayıcısı ve yüz yüze açma anı; ciphertext de kişisel veri gibi korunur |
| G2 — Kısıtlı metadata | Dolaylı ilişkilendirme veya operasyon bilgisi sağlar               | Anonim başvuru kodu, hizmet, geniş zaman tercihi, kesin önerilen zaman, durum, oluşturulma/silinme zamanı, takip hash'i, rate-limit özeti, audit entity ID | Yalnız operasyon için gereken alan tutulur; liste ve loglarda gereksiz ayrıntı gösterilmez; süreli saklanır                        |
| G1 — İç kullanım      | Kimlikle ilişkilendirilmediğinde düşük hassasiyetli işletim verisi | Toplam kayıt sayısı, genel hata kodu, algoritma/şema sürümü, anonim sistem sağlık metriği                                                                  | Kişiselleştirilmeden izlenebilir; yine de değiştirmeye karşı korunur                                                               |
| G0 — Açık             | Kamuya sunulması amaçlanan içerik                                  | Hizmet ve makale içerikleri, klinik iletişim bilgileri, yasal sayfalar                                                                                     | Bütünlük ve yayın yetkisi korunur                                                                                                  |

Sınıflandırma kararları:

- Ciphertext “okunamıyor” diye zararsız kabul edilmeyecek; gelecekte anahtar sızıntısı, korelasyon ve kalıcı kayıt riski nedeniyle G3 sayılacak.
- IV gizli değildir fakat ciphertext ile birlikte bütünlüğü korunacak ve G3 paketinin parçası olarak yönetilecek.
- Takip sırrının açık değeri G4, yalnız hash'i G2'dir. Public başvuru kodu tek başına durum sorgulamak için yeterli olmayacaktır.
- Hizmet ve zaman bilgisi G2'dir. Nadir hizmet + dar zaman + başka dış bilgi kişiyi ayırt edebileceği için admin listesinde saniye hassasiyetli zaman veya gereksiz bağlam gösterilmeyecektir.
- Fiziksel notlar uygulama dışında olsa da G3'tür; kilitli saklama, erişim kaydı/prosedürü, saklama süresi ve güvenli imha gerektirir.

#### Sistem ve güven sınırları

```text
Kullanıcı açık form verisi (G3)
        │  kullanıcının tarayıcısında Web Crypto
        ▼
Ciphertext (G3) + sınırlı metadata (G2) + takip hash'i üretimine esas sır (G4)
        │  yalnız HTTPS
        ▼
Next.js doğrulama/rate limit sınırı
        │
        ├── PostgreSQL: ciphertext + G2 metadata + hash
        ├── Resend: yalnız anonim yeni-talep bildirimi
        └── Admin paneli: G2 metadata; plaintext yok

Yüz yüze: kullanıcı anahtarı (G4) ──► klinik tarayıcısında geçici decrypt
                                      └── gerekiyorsa ayrı fiziksel G3 kayıt
```

Güven sınırları:

1. Kullanıcı cihazı/tarayıcısı: plaintext ve anahtarın bulunduğu tek çevrimiçi alan; tamamen güvenilir kabul edilemez.
2. İnternet/TLS: trafik şifreli olsa da IP, zaman ve paket boyutu gibi metadata görülebilir.
3. Next.js sunucusu: ciphertext'i kabul eder ama çözme yetkisi olmamalıdır; doğrulama, durum ve rate limit işleviyle sınırlıdır.
4. PostgreSQL ve yedekler: ciphertext ve metadata saklar; uygulamadan bağımsız erişim ihtimali tehdit modeline dahildir.
5. Resend: yalnız anonim operasyon bildirimi alır; form payload'ı ve ciphertext almaz.
6. Admin tarayıcısı: metadata ve durum değişikliği görür; yüz yüze anda geçici decrypt yapabilir.
7. Fiziksel klinik kayıt alanı: uygulamadan ayrı güven sınırıdır; dijital gizlilik garantisi fiziksel defteri otomatik korumaz.

#### Aktörler ve yetkileri

| Aktör                                         | Meşru yetki                                            | Tehdit olasılığı                                                          |
| --------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------- |
| Anonim ziyaretçi                              | Form oluşturma, kendi takip sırrıyla durum görme/iptal | Spam, enumeration, kötü amaçlı ciphertext, kaynak tüketimi                |
| Başvuru sahibi                                | Kendi anahtarıyla yüz yüze açma                        | Anahtarı yanlış kişiye verme, ortak cihazda bırakma                       |
| Klinik yöneticisi                             | Metadata görme, zaman önerme, durum değiştirme         | Merak amaçlı erişim, anahtar isteme, ekran görüntüsü/fiziksel kopya riski |
| Editör                                        | Yalnız makale yönetimi                                 | IDOR ile randevu alanına erişmeye çalışma                                 |
| İnternet saldırganı/bot                       | Meşru yetki yok                                        | Brute force, DoS, CSRF, XSS, replay, takip kodu tarama                    |
| DB/hosting erişimi kazanan kişi               | Normalde sınırlı operasyon erişimi                     | Ciphertext/metadata çalma, değiştirme, silme, yedek kopyalama             |
| Tedarik zinciri saldırganı                    | Yetki yok                                              | NPM/third-party script üzerinden şifreleme öncesi plaintext/anahtar çalma |
| Kullanıcı cihazındaki zararlı yazılım/eklenti | Uygulama yetkisi yok                                   | Form ve anahtarı şifreleme öncesi/sonrası okuma                           |
| Hukuken yetkili erişim talebi                 | Geçerli süreçle sınırlı                                | Anahtar klinikte olmadığı için plaintext sağlanamaması; metadata kapsamı  |

#### Derecelendirilmiş tehdit kaydı

Derece: Kritik = production engeli; Yüksek = P0/P1'de kapatılmalı; Orta = azaltılıp izlenmeli; Düşük = belgeli kabul edilebilir.

| ID  | Tehdit                                                            | Etki                                         | Olasılık   | İlk derece | Zorunlu önlem                                                                                                          | Kalan risk                                                                  |
| --- | ----------------------------------------------------------------- | -------------------------------------------- | ---------- | ---------- | ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| T01 | Zararlı/XSS script plaintext veya anahtarı şifreleme öncesi çalar | Kimliğin tamamen açığa çıkması               | Orta       | Kritik     | Sıkı nonce CSP, third-party scriptsiz hassas sayfalar, React encoding, dependency pin/tarama, bağımsız inceleme        | Kullanıcı eklentisi veya tedarik zinciri tümüyle engellenemez               |
| T02 | Sunucu yanlışlıkla plaintext alan kabul eder/loglar               | Toplu kişisel veri sızıntısı                 | Orta       | Kritik     | Server Zod şeması yalnız ciphertext/metadata kabul eder; plaintext alan adları için negatif ağ/log/DB testleri         | Hosting platformunun alt seviye metadata logları doğrulanmalı               |
| T03 | Klinik yedek anahtar saklar veya kullanıcıdan uzaktan ister       | Yüz yüze öncesi kimlik açılır                | Orta       | Kritik     | Klinik anahtar tutmaz; iki kopya kullanıcıya; anahtar telefon/e-posta ile istenmez                                     | Personel eğitimi ve sosyal mühendislik riski                                |
| T04 | Zayıf/tahmin edilebilir takip sırrı enumeration'a uğrar           | Durum ve zaman metadata sızıntısı            | Orta       | Yüksek     | En az 128-bit CSPRNG sır, DB'de yalnız hash, public ID'den ayrı, aynılaştırılmış cevap, rate limit                     | Kullanıcının sırrı paylaşması                                               |
| T05 | Ciphertext/IV/metadata değiştirilir                               | Decrypt hatası veya yanlış bağlama           | Orta       | Yüksek     | AES-GCM doğrulaması, AAD ile başvuru ID/sürüm/metadata bağlama, hatada fail-closed                                     | Kayıt silme/erişilemez kılma DoS'u kalır                                    |
| T06 | IV tekrar kullanılır                                              | AES-GCM gizliliği bozulabilir                | Düşük      | Kritik     | Her başvuruda CSPRNG 96-bit benzersiz IV, testler, anahtar başına tek şifreleme                                        | RNG/platform kusuru                                                         |
| T07 | Replay/çift gönderim çoğaltılır                                   | Operasyon yükü ve korelasyon                 | Yüksek     | Orta       | Ayrı idempotency token hash'i, atomik unique constraint, kısa form yaşı                                                | Kullanıcı bilerek yeni anahtarlarla tekrar başvurabilir                     |
| T08 | IP/fingerprint/identity rate limit kullanıcıları ilişkilendirir   | Anonimlik zayıflar                           | Orta       | Yüksek     | E-posta/telefon ve kalıcı fingerprint kaldırılır; IP yalnız güvenilir proxy'den, dönemsel HMAC ile kısa süreli tutulur | Aynı ağdaki kullanıcılar geçici olarak ilişkilendirilebilir                 |
| T09 | Hizmet/zaman/oluşturma zamanı dış bilgiyle eşleştirilir           | Dolaylı kimlik çıkarımı                      | Orta       | Orta       | Geniş zaman kovaları, listede dakika/saniye azaltma, minimum metadata, kısa saklama                                    | Nadir hizmet ve küçük kullanıcı kitlesi riski                               |
| T10 | Ciphertext boyutu alan uzunluğunu ele verir                       | Kısmi profil çıkarımı                        | Düşük-Orta | Orta       | Sürüm 1 paketini sabit boyut sınıfına padding; aşırı girdiyi reddetme                                                  | Trafik toplam boyutu yine yaklaşık bilgi verebilir                          |
| T11 | Admin hesabı ele geçirilir                                        | Metadata değişimi/silme, zaman manipülasyonu | Orta       | Yüksek     | MFA, server-side rol, kısa opaque session, audit, rate limit, oturum iptali                                            | Saldırgan ciphertext'i okuyamaz ama operasyonu bozabilir                    |
| T12 | Editör IDOR ile randevuya erişir                                  | Metadata sızıntısı/değişiklik                | Düşük-Orta | Yüksek     | Her sayfa/action'da ADMIN kontrolü, kaynak bazlı testler                                                               | Gelecekte yeni endpoint'in kontrolü unutulabilir                            |
| T13 | DB veya yedek çalınır                                             | Ciphertext ve metadata sızıntısı             | Orta       | Yüksek     | Anahtar DB dışında/kullanıcıda, TLS, minimum rol, şifreli yedek, kısa saklama                                          | Gelecekte kullanıcı anahtarı da sızarsa geçmiş veri açılabilir              |
| T14 | Resend'e hassas veri gider                                        | Üçüncü taraf kişisel veri aktarımı           | Orta       | Yüksek     | Sabit anonim şablon; yalnız referans yerine admin panel linki ve genel mesaj; payload negatif testi                    | Alıcı adresi ve bildirim zamanı metadata oluşturur                          |
| T15 | Log/audit/hata sistemi sır veya plaintext kaydeder                | Kalıcı ve yaygın sızıntı                     | Orta       | Kritik     | Allowlist yapılandırılmış log; request body/ciphertext/key yok; yalnız güvenli hata kodu; CI/E2E negatif test          | Platform erişim loglarında IP/zaman kalabilir                               |
| T16 | Browser storage/history/cache anahtarı tutar                      | Ortak cihazda kimlik açılır                  | Orta       | Yüksek     | URL/cookie/localStorage/IndexedDB yok; `no-store`; açık indirme onayı; sayfa kapanınca state temizleme                 | JavaScript belleğinin anında sıfırlanması garanti edilemez                  |
| T17 | Kullanıcı iki anahtar kopyasını kaybeder                          | Kayıt açılamaz                               | Orta       | Orta       | İndir + yazdır seçenekleri, açık uyarı, yeni başvuru yolu                                                              | Bilinçli olarak kurtarma yok; gizlilik lehine kabul                         |
| T18 | Kullanıcı sahte QR/anahtar sunar                                  | Başkasının verisini açma denemesi            | Düşük      | Orta       | Başvuru ID + authenticated package bağlama; yalnız eşleşen paket açılır; başarısız deneme içerik loglamaz              | Çalınmış gerçek anahtar ayırt edilemez                                      |
| T19 | Yüz yüze açılan veri ekranda/defterde sızar                       | Klinik gizlilik ihlali                       | Orta       | Yüksek     | İzole cihaz, otomatik kapanma, ekran konumu; kilitli fiziksel dosya, erişim/saklama/imha prosedürü                     | Yetkili kişinin kötüye kullanımı tamamen teknik çözülemez                   |
| T20 | Silme işi/backup retention başarısız olur                         | Gereksiz uzun saklama                        | Orta       | Orta       | Otomatik cleanup alarmı, yedek TTL, düzenli restore/silme denetimi                                                     | Sağlayıcı felaket yedeklerinin gecikmeli silinmesi                          |
| T21 | Trafik analizi IP + zaman + paket boyutunu birleştirir            | Kullanıcı ilişkilendirme                     | Orta       | Orta       | HTTPS, padding, üçüncü taraf isteği yok, minimum log/retention                                                         | ISP/hosting seviyesinde tamamen önlenemez; Tor iddiası yok                  |
| T22 | Kullanıcı cihazı/eklenti ele geçirilmiştir                        | Plaintext ve anahtar çalınır                 | Düşük-Orta | Yüksek     | Kullanıcı uyarısı, third-party scriptsiz sayfa, anahtarı kalıcı saklamama                                              | Uygulama ele geçirilmiş istemciyi güvenilir hâle getiremez; açık kalan risk |
| T23 | Çocuk/ergen başvurusu uygun onam olmadan işlenir                  | Hukuki/etik zarar                            | Belirsiz   | Yüksek     | Yaş verisi toplanmadan uygulanabilir yasal temsilci/onam akışı hukuk ve mesleki görüşle belirlenir                     | Dış karar tamamlanmadan production kapalı                                   |
| T24 | Form acil yardım bekleyen kişi tarafından kullanılır              | Yardımın gecikmesi, kişi güvenliği           | Orta       | Kritik     | Form/takipte görünür 112/en yakın acil servis uyarısı; acil anlatı alanı yok; anlık yanıt vaadi yok                    | Kullanıcının uyarıyı görmezden gelmesi                                      |

#### Metadata, rate limit ve korelasyon kararları

- Açık hizmet seçimi yalnız yayımlanmış kategori slug/ID'si olacaktır; kullanıcı serbest metinle hizmet yazamayacaktır.
- Zaman tercihi önceden tanımlı geniş aralıklardan seçilecektir. Kullanıcının kesin tarih/saat veya açıklama yazacağı açık alan olmayacaktır.
- Kesin önerilen zaman admin tarafından onay sırasında eklenir ve yalnız takip sırrıyla görüntülenir; admin listesinde gereksizse tam saat gösterilmez.
- Eski `requestFingerprintHash` yeni kayıtlarda üretilmeyecek ve migration sonunda kolon kaldırılacaktır.
- Rate limit kimliği olarak e-posta/telefon kullanılmayacaktır. Güvenilir proxy varsa normalize IP'nin kısa dönemli, sürümlü HMAC özeti; yoksa idempotency ve genel kapasite limiti kullanılacaktır.
- Rate-limit HMAC etiketi kullanım amacı ve zaman kovasıyla ayrılacak; uygulamanın başka alanlarındaki hash'lerle eşleştirilemeyecektir.
- Rate-limit kayıtları pencere biter bitmez otomatik temizlenecek; audit loga IP veya hash kopyalanmayacaktır.
- Public başvuru kodu loglarda gerekmedikçe bulunmayacak; iç UUID/audit entity ID kullanıcıya gösterilmeyecektir.
- Başvuru listesindeki oluşturulma zamanı operasyonun ihtiyaç duyduğu hassasiyete yuvarlanacak; DB'de bütünlük için gerçek zaman tutulabilir.

#### Log, yedek, üçüncü taraf ve geçici veri kararları

- Uygulama logları allowlist olacaktır: olay adı, güvenli hata kodu, anonim request ID ve sayısal metrik. Form verisi, ciphertext, IV, anahtar, takip sırrı/hash'i ve public başvuru kodu loglanmayacaktır.
- Audit log yalnız aktör admin ID, eylem, iç entity ID, önceki/yeni durum ve `decryptionAttempted/decryptionSucceeded` gibi boole değerler tutacaktır; açılan içerik veya operasyonel serbest not tutulmayacaktır.
- Hassas form, takip ve decrypt sayfalarında analitik, reklam, session replay, chat, üçüncü taraf QR, harita veya embed bulunmayacaktır.
- Resend'e yalnız sabit anonim metin gönderilecek; ciphertext veya başvuruya erişim sağlayan hiçbir değer gönderilmeyecektir.
- PostgreSQL geçici tabloları, hata kuyrukları ve provider query logları production öncesi kontrol edilecek; statement/body loglama kapalı tutulacaktır.
- Yedekler G3 kabul edilecek; sağlayıcı şifrelemesi, sınırlı erişim, bölge, saklama süresi ve silme davranışı doğrulanacaktır.
- Test/staging verisinde gerçek kişi bilgisi kullanılmayacak; production yedeği test ortamına kopyalanmayacaktır.
- Fiziksel klinik kayıt uygulama yedeğine dahil değildir; ayrı saklama ve imha envanterine sahip olacaktır.

#### Tarayıcı belleği ve kullanıcı cihazı kararı

- Plaintext kontrollü React state/FormData içinde yalnız form açıkken bulunacaktır; global store kullanılmayacaktır.
- Şifreleme tamamlanınca form alanları ve uygulama state'i temizlenecek, fakat JavaScript garbage collection nedeniyle fiziksel belleğin anında sıfırlanmasının garanti edilemeyeceği risk kaydında kalacaktır.
- AES anahtarı varsayılan olarak extractable üretilecek çünkü kullanıcıya dışa aktarılması gerekiyor; export sonrasında uygulama referansı bırakılmayacaktır.
- Anahtar otomatik olarak panoya kopyalanmayacak; kullanıcı açıkça seçerse pano riski anlatılacaktır.
- Kurtarma dosyası açık kişisel veri içermeyecek; dosya adı kimliği veya hizmeti göstermeyecektir.
- Ortak cihaz uyarısı, indirme/yazdırma seçenekleri ve sayfadan ayrılmadan önce güvenli kopya kontrolü sağlanacaktır.
- Hassas sayfalara `Cache-Control: no-store` ve arama motoru engeli uygulanacaktır.

- [x] Korunacak varlıklar listelenir: açık form verisi, şifreli paket, kullanıcı anahtarı, takip kodu, durum bilgisi, audit kaydı ve yedekler.
- [x] Tehdit aktörleri tanımlanır: internet saldırganı, kötü amaçlı bot, veritabanı erişimi kazanan kişi, hosting çalışanı, ele geçirilmiş admin hesabı ve kötü niyetli iç kullanıcı.
- [x] Tarayıcıya zararlı JavaScript enjekte edilmesi ana tehditlerden biri olarak kaydedilir; istemci şifrelemenin XSS karşısında tek başına koruma sağlamadığı belirtilir.
- [x] Kullanıcının cihazında zararlı yazılım veya tarayıcı eklentisi bulunması kalan risk olarak kaydedilir.
- [x] Trafik analiziyle zaman, hizmet türü, IP ve paket boyutundan kimlik çıkarımı riski değerlendirilir.
- [x] Şifreli alan uzunluklarının bilgi sızdırmaması için sabit boyut/padding ihtiyacı değerlendirilir. — Sabit boyut sınıfları kriptografik mimaride kesinleştirilecek.
- [x] Aynı kişinin tekrar başvurusunu ilişkilendirebilecek fingerprint, IP hash veya kalıcı tanımlayıcılar kaldırılır ya da ciddi şekilde sınırlandırılır. — Fingerprint kaldırılacak; dönemsel rate-limit özeti kısa süreli kalacak.
- [x] Rate limiting için kullanılan verinin anonimlik üzerindeki etkisi belgelenir.
- [x] Admin audit kayıtlarında kimlik, şifreli veri, anahtar, takip sırrı veya hassas metadata tutulmaması sağlanır. — Allowlist audit sözleşmesi belirlendi; uygulaması P1'de test edilecek.
- [x] Hata izleme, analitik, session replay ve üçüncü taraf scriptlerin form alanlarına erişmesi yasaklanır.
- [x] Yedekler, loglar, geçici tablolar ve hata kuyrukları veri akış diyagramına dahil edilir.
- [x] Şifreleme öncesi açık verinin tarayıcı belleğinde ne kadar süre kaldığı belgelenir. — Form açıkken ve şifreleme tamamlanana kadar; GC nedeniyle fiziksel sıfırlama garantisi verilmez.

Tehdit modeli çıkış notu: **24 tehdit senaryosu kaydedildi; T01, T02, T03, T06, T15 ve T24 kritik production kapılarıdır.** Tasarım önlemleri belirlendi, fakat riskler kod/test/altyapı kanıtı oluşmadan kapatılmış sayılmaz.

### P0 — Kriptografik mimari

#### Kriptografik sözleşme — sürüm 1

Bu sözleşme uygulama ve testlerin tek kaynağıdır. Kendi algoritmamız tasarlanmayacak; tarayıcının standart Web Crypto API'si kullanılacaktır.

| Bileşen                | Sürüm 1 kararı                                                                                                   |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Şifreleme              | `AES-GCM`                                                                                                        |
| Veri anahtarı          | Her başvuru için bağımsız 256 bit (32 byte), `crypto.getRandomValues` ile                                        |
| IV/nonce               | Her başvuru için bağımsız 96 bit (12 byte), `crypto.getRandomValues` ile; aynı anahtarla asla tekrar kullanılmaz |
| Authentication tag     | 128 bit; Web Crypto çıktısında ciphertext'in sonuna eklenmiş olarak tutulur                                      |
| Metin kodlaması        | UTF-8 (`TextEncoder`/`TextDecoder`, fatal decode doğrulaması)                                                    |
| Binary metin gösterimi | Padding içermeyen base64url; tek canonical encoder/decoder                                                       |
| Payload şeması         | `pc-hd-appointment-payload/v1`                                                                                   |
| Zarf şeması            | `pc-hd-appointment-envelope/v1`                                                                                  |
| AAD şeması             | `pc-hd-appointment-aad/v1`                                                                                       |
| Plaintext boyutu       | Sabit 2048 byte zarf; 4 byte uzunluk + JSON + kriptografik rastgele padding                                      |
| Ciphertext boyutu      | Tam 2064 byte: 2048 byte ciphertext + 16 byte GCM tag                                                            |
| Takip sırrı            | Şifreleme anahtarından bağımsız 256 bit; sunucuda yalnız ayrı ve sürümlü anahtarla HMAC-SHA-256 özeti            |
| Idempotency sırrı      | Diğer sırlardan bağımsız 128 bit; sunucuda SHA-256 özeti ve unique constraint                                    |
| Public başvuru kimliği | Tarayıcıda bağımsız 128 bit; base32/gruplu gösterim; güvenlik tek başına buna dayanmaz                           |

Neden birleşik ciphertext: Web Crypto AES-GCM `encrypt()` sonucu authentication tag'i ciphertext'in sonuna ekler. Ayrı tag kesip birleştirme kodu yeni hata yüzeyi oluşturacağından veritabanı ve ağ sözleşmesinde tek `ciphertext` alanı kullanılacaktır.

#### Hassas payload sözleşmesi

Şifrelenmeden önce oluşturulan JSON, anahtar sırası sabit ve fazladan alan kabul etmeyen şu mantıksal yapıda olacaktır:

```json
{
  "schema": "pc-hd-appointment-payload/v1",
  "fullName": "string",
  "email": "string|null",
  "phone": "string|null"
}
```

- `fullName` trim ve Unicode NFC normalizasyonundan sonra 2–120 karakter ve en fazla 256 UTF-8 byte olacaktır.
- E-posta küçük harfe dönüştürülmeden önce trim edilecek; doğrulanmış adres en fazla 254 karakter ve 320 UTF-8 byte olacaktır. Orijinal kullanıcının yazımı şifreli pakette korunabilir.
- Telefon yalnız izin verilen karakterlerden normalize edilip uluslararası biçime yaklaşacak; en fazla 32 karakter ve 64 UTF-8 byte olacaktır.
- E-posta veya telefondan en az biri zorunlu kalacaktır; iletişim tercihi şifreli pakete alınmayacaktır çünkü klinik randevu öncesinde iletişim kurmayacaktır.
- Serbest not, doğum tarihi, kimlik numarası, tanı ve sağlık öyküsü payload v1'de bulunmayacaktır.
- Bilinmeyen/fazladan JSON alanları hem encrypt öncesi hem decrypt sonrası reddedilecektir.
- JSON byte uzunluğu 2044 byte'ı aşarsa işlem şifresiz fallback olmadan duracaktır.

#### Sabit boyutlu plaintext zarfı

1. Canonical payload JSON UTF-8 byte dizisine çevrilir.
2. İlk 4 byte unsigned big-endian olarak JSON byte uzunluğunu taşır.
3. Ardından JSON byte dizisi yazılır.
4. Kalan alan `crypto.getRandomValues` ile rastgele doldurularak toplam tam 2048 byte yapılır.
5. 2048 byte zarf AES-256-GCM ile şifrelenir; ağdaki ciphertext her zaman 2064 byte olur.
6. Decrypt sonrası uzunluk `1..2044` aralığında değilse, UTF-8 geçersizse, JSON şeması tutmazsa veya kalan zarf biçimi beklenmiyorsa genel `DECRYPT_FAILED` sonucu verilir.

Padding, içerik uzunluğını kesin olarak gizlemeye yardımcı olur; IP, zamanlama ve toplam HTTP çerçevesi gibi trafik metadata'sını gizlediği iddia edilmez.

#### Değiştirilemez AAD sözleşmesi

AAD JSON yerine alan sırası sabit bir UTF-8 metni olacaktır. Her parça allowlist doğrulamasından geçtiği için ayraç enjeksiyonu kabul edilmeyecektir:

```text
pc-hd-appointment-aad/v1\n
requestId=<base32-128-bit>\n
service=<allowlisted-service-slug-or-none>\n
timePreference=<allowlisted-time-code>\n
privacyNotice=<fixed-version>
```

- AAD şifrelenmez fakat GCM tarafından doğrulanır.
- `requestId`, hizmet, ilk zaman tercihi ve aydınlatma sürümü kayıt oluşturulduktan sonra değiştirilemez.
- Adminin önerdiği kesin tarih/saat, durum, oluşturulma zamanı ve saklama zamanı değişebilir veya sunucu üretimi olduğu için AAD'ye dahil edilmez.
- Encrypt ve decrypt aynı ortak `encodeAadV1()` fonksiyonunu kullanır; elle string üretimi başka katmanlarda yasaktır.
- AAD alanlarından biri değiştirilirse decrypt fail-closed olur ve hiçbir kısmi plaintext gösterilmez.

#### Ağ/veritabanı zarfı

Sunucunun kabul edeceği hassas olmayan taşıma biçimi:

```json
{
  "envelopeSchema": "pc-hd-appointment-envelope/v1",
  "algorithm": "AES-256-GCM",
  "requestId": "BASE32_PUBLIC_ID",
  "payloadSchema": "pc-hd-appointment-payload/v1",
  "iv": "base64url-12-bytes",
  "ciphertext": "base64url-2064-bytes",
  "serviceSlug": "allowlisted-or-null",
  "timePreference": "allowlisted-code",
  "privacyNoticeVersion": "fixed-version",
  "trackingSecret": "base64url-32-bytes",
  "idempotencyToken": "base64url-16-bytes"
}
```

`trackingSecret` ilk HTTPS gönderiminde ve sonraki yetkili durum sorgularında, `idempotencyToken` ise ilk gönderim/tekrarında geçici olarak sunucu belleğine girer; veritabanına ham yazılmaz. Sunucu bunları sırasıyla alan-ayrımlı, ayrı/sürümlü anahtarla HMAC ve SHA-256 özetine dönüştürür. Ana AES anahtarı bu zarfın parçası değildir ve hiçbir ağ isteğinde sunucuya gönderilmez.

Sunucu şu kesin uzunlukları decode ederek doğrular: IV 12 byte, ciphertext 2064 byte, takip sırrı 32 byte, idempotency 16 byte, request ID 16 byte. Gevşek base64, alternatif alfabe, padding karakteri, bilinmeyen sürüm/algoritma ve fazladan alan reddedilir.

#### Bağımsız sırlar ve alan ayrımı

- `dataKey`, `trackingSecret`, `idempotencyToken`, `requestId` ve IV birbirinden bağımsız CSPRNG çağrılarıyla üretilir.
- Bir sır diğerinden hash/KDF ile türetilmez; birinin açığa çıkması diğerlerini doğrudan vermemelidir.
- Takip hash'i `HMAC-SHA-256(TRACKING_HMAC_KEY_V1, "appointment-tracking/v1\0" || trackingSecret)` biçiminde alan ayrımlı olacaktır; admin oturum `AUTH_SECRET` değeri bu amaçla tekrar kullanılmayacaktır.
- Kayıt `trackingKeyVersion` taşır. HMAC anahtarı rotasyonunda yeni kayıtlar yeni sürümü kullanır; eski anahtar, o sürümdeki son kayıt silinene kadar yalnız doğrulama için güvenli secret store'da tutulur.
- Rate-limit HMAC etiketi ve anahtar bağlamı takip HMAC'inden tamamen farklı olacaktır.
- Public request ID ve takip sırrı birlikte sorgulanır; yalnız request ID kayıt varlığını doğrulamaz.
- Karşılaştırmalar mümkün olan yerde sabit zamanlı yapılır; hata cevapları kayıt varlığını ayırt ettirmez.

#### Kurtarma belgesi — sürüm 1

Kullanıcıya ağ gönderiminden **önce** aynı içeriğin iki kopyasını indirme/yazdırma imkânı verilecektir. Klinik kopya tutmayacaktır. Bu sıra, kayıt sunucuda oluştuğu anda kullanıcı anahtarının kaybolmasını engeller.

```json
{
  "schema": "pc-hd-appointment-recovery/v1",
  "requestId": "BASE32_PUBLIC_ID",
  "trackingSecret": "base64url-32-bytes",
  "dataKey": "base64url-32-bytes",
  "payloadSchema": "pc-hd-appointment-payload/v1"
}
```

- Dosya yalnız kullanıcının tarayıcısında oluşturulur; sunucuya veya üçüncü taraf QR servisine gönderilmez.
- Dosya adı kimlik/hizmet içermez: `randevu-kurtarma-<kısa-public-id>.json`.
- QR ilk sürüm için zorunlu değildir. Eklenirse yalnız yerel, sabitlenmiş ve incelenmiş kodla üretilir; aynı recovery verisini taşır.
- Ekranda varsayılan olarak yalnız public kod görünür; sırlar “göster” eylemi olmadan açılmaz.
- Otomatik pano kopyalama yapılmaz. Açık kullanıcı eylemiyle kopyalamada pano riski belirtilir.
- “İndirildi” işareti güvenlik kanıtı sayılmaz; kullanıcı iki bağımsız kopyayı güvenli sakladığını açıkça teyit etmeden ağ gönderimi başlamaz.
- Gönderim başarısız olursa aynı request ID, key, IV, ciphertext, takip sırrı ve idempotency değeri yeniden kullanılır; aynı plaintext tekrar yeni IV ile şifrelenip belgeden kopuk ikinci paket oluşturulmaz.
- Recovery belgesi plaintext kişisel bilgi içermez fakat G4 anahtar materyalidir; ele geçiren kişi ciphertext'e erişirse kimliği açabilir ve durumu takip edebilir.
- İki kopya da kaybolursa kurtarma yoktur; klinik anahtar saklamaz ve kullanıcı yeni başvuru yapar.

#### Anahtar yaşam döngüsü

1. Tarayıcıda secure context ve `crypto.subtle` desteği doğrulanır; yoksa form gönderilemez.
2. Bağımsız rastgele değerler üretilir; AES anahtarı raw 32 byte olarak `importKey` ile yalnız `encrypt/decrypt` kullanımına alınır.
3. Plaintext zarf bir kez şifrelenir; recovery belgesi yerel olarak hazırlanır ve kullanıcı iki kopyayı sakladığını teyit eder.
4. Sunucuya yalnız taşıma zarfı gönderilir. Ağ hatasında aynı hazırlanmış paket idempotent biçimde yeniden gönderilir.
5. Başarılı yanıt başvuru kimliğiyle eşleşince form alanları, plaintext byte dizileri ve gereksiz uygulama referansları `finally` bloklarında temizlenir; JavaScript GC'nin fiziksel sıfırlama garantisi olmadığı açıkça kabul edilir.
6. Kullanıcı gönderimden vazgeçerse hazırlanan sırlar uygulama belleğinden temizlenir; indirdiği kullanılmamış recovery kopyalarını kendisi güvenli siler.
7. Yüz yüze açmada recovery dosyası kullanıcı tarafından seçilir; anahtar tarayıcı belleğine import edilir, decrypt yapılır, sonuç kısa süre gösterilir.
8. Decrypt ekranı kapanınca plaintext ve anahtar referansları temizlenir; veri sunucuya geri gönderilmez.
9. Her başvuru ayrı veri anahtarı kullandığı için merkezi veri anahtarı rotasyonu yoktur. Algoritma/sürüm zafiyeti olursa yeni başvurular yeni sürüme geçirilir; eski kayıtlar kullanıcı anahtarı olmadan yeniden şifrelenemez. Sunucudaki takip HMAC anahtarlarının rotasyonu ayrıca sürümlü yürütülür.

#### Sürümleme ve destek politikası

- Algoritma, payload, envelope, AAD ve recovery sürümleri birbirinden açıkça ayrılır; bilinmeyen sürüm sessizce yorumlanmaz.
- Sürüm 1 decrypt desteği, ilişkili son kayıt yasal/operasyonel saklama süresinden silinene kadar korunur.
- Yeni sürüm yalnız yeni kayıtlar için varsayılan yapılır. Eski kayıt server-side re-encrypt edilemez çünkü anahtar klinikte yoktur.
- Bir sürüm kritik derecede güvensizleşirse form o sürümle yeni kayıt kabul etmeyi derhal durdurur; mevcut kullanıcılara takip ekranında yeni başvuru yönlendirmesi gösterilir.
- Şifreleme modülü `lib/appointments/crypto/` altında browser-safe, küçük, framework bağımsız ve server import'una karşı sınırlandırılmış olacaktır.
- Sürüm 1 için dış kriptografi paketi gerekmez. Web Crypto, TextEncoder/Decoder ve küçük kendi encoding/zarf kodumuz kullanılır; şifreleme primitive'i yazılmaz.

#### Hata sözleşmesi

- Dış kullanıcıya yalnız güvenli sınıflar gösterilir: `CRYPTO_UNAVAILABLE`, `INVALID_RECOVERY_FILE`, `DECRYPT_FAILED`, `UNSUPPORTED_VERSION`, `SUBMISSION_FAILED`.
- Web Crypto/DOMException mesajı, payload, anahtar, IV, ciphertext, AAD, tracking secret veya request ID loglanmaz.
- Authentication hatasında plaintext'in hiçbir kısmı döndürülmez veya render edilmez.
- Şifreleme başarısızlığında plaintext Server Action'a gönderilmez ve şifresiz fallback yapılmaz.
- Recovery dosyası parse edilmeden önce byte boyutu sınırlandırılır; prototip kirliliği ve fazladan alanlar strict şemayla reddedilir.

#### Mimari kabul testleri

- Sabit test vektörüyle aynı key/IV/AAD/plaintext için beklenen ciphertext doğrulanır; yalnız testte sabit IV kullanılır.
- Production API'si çağrılarında IV/key/random değerlerin bağımsız üretildiği test edilir.
- Round-trip; Türkçe karakter, boş isteğe bağlı alan ve maksimum byte sınırlarında çalışır.
- Yanlış key, IV, AAD, ciphertext veya tag tek-bit değişiminde `DECRYPT_FAILED` verir.
- Tüm geçerli ciphertext çıktıları tam 2064 byte olur; farklı ad/e-posta uzunlukları aynı boyutu üretir.
- AES anahtarı ve plaintext'in ağ zarfında bulunmadığı; takip sırrının DB/log/browser storage'a kalıcı yazılmadığı; ciphertext'in ise yalnız beklenen DB alanında bulunduğu negatif test edilir.
- Bilinmeyen sürüm, gevşek base64, yanlış uzunluk, fazla JSON alanı ve bozuk UTF-8 reddedilir.
- Chrome, Firefox, Safari ve Edge'in desteklenen sürümlerinde Web Crypto uyumluluğu E2E doğrulanır.
- Bağımsız güvenlik uzmanı sözleşmeyi ve implementasyonu production öncesi inceler.

- [x] Kendi şifreleme algoritmamızı tasarlamama kararı kaydedilir; tarayıcının standart Web Crypto API'si kullanılır.
- [x] Her başvuru için `crypto.getRandomValues` ile bağımsız, yüksek entropili 256 bit veri şifreleme anahtarı tasarlanır.
- [x] Hassas alanlar tek bir sürümlü, strict JSON paketinde birleştirilir ve UTF-8 olarak kodlanır.
- [x] Paket AES-256-GCM doğrulanmış şifrelemesiyle tarayıcıda şifrelenmek üzere sabitlenir.
- [x] Her şifreleme için bağımsız 96 bit IV tasarlanır; aynı anahtarla tekrar kullanımı yasaktır.
- [x] Başvuru kimliği, şema sürümü ve değişmez açık metadata GCM `additionalData` ile bütünlüğe bağlanır.
- [x] Veritabanında yalnız ciphertext+tag, IV, algoritma ve sürümler tutulacak şekilde sözleşme belirlenir.
- [x] Ham AES anahtarı Server Action'a, API'ye, PostgreSQL'e, loglara veya analitiğe gönderilmez.
- [x] Anahtar URL query parametresine konmaz; referrer, tarayıcı geçmişi ve sunucu loglarına sızması yasaktır.
- [x] Anahtar cookie, localStorage, sessionStorage, IndexedDB veya sunucu session'ında kalıcı tutulmaz.
- [x] Kullanıcıya verilen recovery paketi başvuru kodu, takip sırrı ve çözme anahtarını sürümlü biçimde içerir.
- [x] QR kodun yalnız cihazda üretileceği kararı verildi; ilk sürümde QR zorunlu değildir.
- [x] İndirme/yazdırma ve iki güvenli kullanıcı kopyası akışı belirlendi; otomatik pano kopyalama yoktur.
- [x] Anahtar materyalinin ekranda yalnız açık kullanıcı eylemiyle gösterilmesi kararlaştırıldı.
- [x] Gönderim/decrypt sonrası plaintext ve anahtar referanslarını temizleme yaşam döngüsü belirlendi; GC sınırı kaydedildi.
- [x] Algoritma, payload, envelope, AAD ve recovery şemaları ayrı ayrı sürümlendi.
- [x] Eski sürümlerin destek süresi ve kritik sürüm kaldırma davranışı belirlendi.
- [x] Kriptografik kodun küçük, framework bağımsız `lib/appointments/crypto/` modülünde tutulması kararlaştırıldı.
- [x] Sürüm 1'de harici kriptografi bağımlılığı kullanılmaması kararlaştırıldı; primitive yalnız Web Crypto olacaktır.

Kriptografik mimari uygulama durumu:

- [x] Browser-safe sürüm 1 çekirdeği `lib/appointments/crypto/` altında uygulandı; Node `Buffer` veya harici kriptografi paketi kullanılmıyor.
- [x] Strict base64url/base32, exact alan/uzunluk doğrulaması, canonical AAD, 2048 byte rastgele padded zarf ve AES-256-GCM round-trip uygulandı.
- [x] Sabit test materyaliyle interoperability ciphertext SHA-256 vektörü kaydedildi.
- [x] Türkçe round-trip, sabit 2064 byte çıktı, bağımsız rastgele sırlar, tekrar şifrelemede farklı çıktı, yanlış key ve ciphertext/IV/AAD oynama testleri geçti.
- [x] Ağ zarfında plaintext ve AES anahtarı bulunmadığı negatif test edildi.
- [x] Recovery indirme/yazdırma, Server Action/Prisma entegrasyonu, yüz yüze decrypt ekranı ve Chromium browser-storage/ağ/DB E2E kanıtı tamamlandı.
- [ ] Chrome, Firefox, Safari ve Edge gerçek tarayıcı testleri ile bağımsız uzman incelemesi henüz yapılmadı.

Kriptografik mimari çıkış notu: **Sürüm 1 sözleşmesi, şifreli başvuru, anonim takip ve tarayıcıda yüz yüze açma akışları entegre edildi; son doğrulamada 65 test, typecheck, lint ve production build geçti.** Bağımsız güvenlik incelemesi, hukuk onayı ve aşağıdaki açık production kapıları tamamlanmadan form canlıya açılamaz.

### P0 — Başvuru ve anonim takip akışı

- [x] Form hassas alanları sunucuya göndermeden önce tarayıcıda doğrular.
- [x] Sunucu, açık hassas alanları kabul etmeyen ayrı bir Zod şeması kullanır.
- [x] Sunucuya yalnız şifreli paket, IV, sürüm, açık bırakılması onaylanan alanlar ve bot koruma verisi gönderilir.
- [x] Sunucu ciphertext için maksimum boyut ve beklenen base64/base64url biçimini doğrular.
- [x] Başvuru veritabanına ilk anda `PENDING` durumuyla ve yalnız şifreli olarak yazılır.
- [x] Onay, veriyi tekrar kaydetmek yerine yalnız durum ve önerilen zaman alanını değiştirir.
- [x] Red, iptal ve süresi dolma durumları ayrı durum kodlarıyla tutulur.
- [x] Tahmin edilemeyen bir public başvuru kimliği oluşturulur; artan sıra numarası kullanılmaz.
- [x] Durum sorgulamak için public kimlikten ayrı, 256 bit takip sırrı üretilir.
- [x] Takip sırrının yalnız sürümlü HMAC özeti veritabanında tutulur.
- [x] Durum sorgusu hem başvuru kimliğini hem takip sırrını gerektirir.
- [x] Durum sorgulama endpoint'i rate limit ve enumeration koruması kullanır.
- [x] Bulunamadı, yanlış kod ve silinmiş kayıt cevapları aynılaştırılır.
- [x] Takip ekranı ad, telefon, e-posta veya şifreli paketin kendisini göstermez.
- [x] Kullanıcı onaylanan zaman bilgisini takip ekranında görür.
- [ ] Randevu değişikliği gerekiyorsa kimlik açmadan yeni zaman önerme akışı tasarlanır.
- [x] Kullanıcı kendi başvurusunu takip sırrıyla iptal edebilir; durum geçmişi ve kimliksiz audit kaydı atomik olarak yazılır.
- [x] Tarayıcı JavaScript/Web Crypto desteklemiyorsa açık veri gönderilmez; form güvenli biçimde durur.
- [x] Şifreleme başarısız olursa otomatik olarak şifresiz gönderime düşülmez.
- [x] Ağ kesintisi ve tekrar gönderimde aynı şifreli başvurunun çoğalmasını engelleyen idempotency uygulanır.

### P0 — Yönetim paneli ve yüz yüze açma

- [x] Yönetim paneli varsayılan olarak ciphertext'i göstermeyen “Şifreli kimlik bilgisi” etiketi kullanır.
- [x] Yönetici listesinde yalnız başvuru kodu, hizmet, zaman tercihi, oluşturulma tarihi ve durum görünür.
- [x] Admin arama ve filtreleme özellikleri hassas alanlara ihtiyaç duymaz.
- [x] Admin onay/red işlemleri ciphertext'i çözmeden yapılır.
- [x] Bildirim e-postası yalnız yeni anonim talep bilgisini içerir.
- [x] Bildirim e-postasına ciphertext, takip sırrı veya kişisel alanlar eklenmez.
- [x] Yüz yüze açma için ayrı, açıkça işaretlenmiş ve otomatik kapanan bölüm uygulanır.
- [x] Çözme anahtarı yönetici sunucusuna gönderilmeden yalnız klinikteki tarayıcıda kullanılır.
- [x] Çözme işlemi Web Crypto API ile tarayıcı tarafında çalışır; server action decrypt yapmaz.
- [x] Açılan bilgiler veritabanına tekrar açık biçimde yazılmaz.
- [x] Açılan bilgiler uygulama tarafından audit loguna veya hata izleme aracına gönderilmez.
- [x] Açma ekranında kopyalama, yazdırma ve ekran görüntüsü riskleri için operasyonel uyarı bulunur.
- [x] Çözülmüş veri sayfa yenilenince ve ekran kapanınca uygulama durumundan temizlenir.
- [x] Çözme ekranında beş dakikalık zaman aşımı ve görünür “hemen kapat” düğmesi bulunur.
- [x] Yanlış anahtar, bozulmuş paket ve eski şema durumları kişisel veri sızdırmadan ele alınır.
- [ ] Hangi yöneticinin hangi başvuruyu ne zaman açtığı, içerik kaydedilmeden audit edilir.
- [ ] Açma yetkisi yalnız gerekli role verilir; editör hesabı hiçbir randevu verisine erişemez.
- [ ] Omuz üzerinden izleme ve ortak bilgisayar riskine karşı klinik cihaz kullanım prosedürü hazırlanır.

### P0 — Veri modeli ve mevcut verilerin geçişi

- [x] Prisma veri modeli plaintext `fullName`, `email`, `phone`, `note` alanlarını kaldıracak şekilde yeniden tasarlandı.
- [x] `encryptedPayload`, sürüm/algoritma, IV, açık metadata ve takip sırrı HMAC alanları tanımlandı.
- [x] Ciphertext sabit uzunluk doğrulamasıyla `Text` kolonda tutulur.
- [x] Plaintext alanların şemada bulunmadığını denetleyen privacy audit yazıldı.
- [x] Yeni kayıtların yalnız şifreli alanlara yazıldığını doğrulayan uygulama testi yazıldı.
- [x] Plaintext kolonlar korumalı migration ile tamamen kaldırıldı.
- [x] Mevcut randevu kayıtları envanterlendi; toplam kayıt sıfır olarak doğrulandı.
- [x] Onaylanan test kaydı silme kararından sonra sıfır kayıtla migration uygulandı.
- [x] Eski açık kayıtların kullanıcı anahtarı olmadan aynı gizlilik modeline taşınamayacağı belgelendi.
- [ ] Migration öncesi şifreli yedek alınır ve erişim sınırlandırılır.
- [ ] Migration loglarının açık kişisel veri içermediği doğrulanır.
- [ ] Geri alma planının tekrar plaintext toplamaya başlamadığı doğrulanır.
- [ ] Development ve test fixture'larında gerçek kişi bilgileri kullanılmaz.

### P1 — Çok yüksek öncelikli uygulama güvenliği

- [ ] CSP production ortamında nonce tabanlı kalır; üçüncü taraf script eklenmesi güvenlik onayına bağlanır.
- [ ] Form ve çözme ekranında analitik, reklam, chat, session replay, harita veya üçüncü taraf embed çalışmaz.
- [ ] Subresource Integrity uygulanabilir dış statik kaynaklarda zorunlu tutulur; tercih self-host etmektir.
- [ ] Hassas sayfalara `Cache-Control: no-store` uygulanır.
- [ ] Takip ve çözme ekranları arama motorlarından engellenir; sitemap'e dahil edilmez.
- [ ] Hassas değerler URL, route segmenti, query string ve fragment içinde taşınmaz.
- [ ] Referrer policy ve tarayıcı cache davranışı gerçek production origin'de doğrulanır.
- [ ] Form gönderiminde origin kontrolü, CSRF koruması, honeypot ve merkezi rate limit korunur.
- [x] Ciphertext, IV ve metadata değiştirme kripto testleriyle; aynı Server Action gövdesinin replay edilmesi Chromium/PostgreSQL E2E testiyle doğrulandı.
- [ ] Admin hesaplarında MFA, kısa oturum, oturum iptali ve güçlü parola politikası zorunlu hâle getirilir.
- [ ] Production database rolü minimum yetkili olur ve doğrulamalı TLS kullanır.
- [ ] Hosting ve veritabanı yönetici hesaplarında donanım anahtarı veya güçlü MFA kullanılır.
- [ ] Production source map, ayrıntılı hata ve debug endpoint'leri kapalı tutulur.
- [ ] Bağımlılık, secret ve istemci bundle taraması CI'da çalışır.
- [ ] Tarayıcı bundle'ında özel anahtar, sunucu secret'ı veya test anahtarı bulunmadığı otomatik kontrol edilir.
- [ ] Şifreleme modülü ve form akışı bağımsız kod incelemesinden geçer.

### P1 — Kriptografi ve gizlilik testleri

- [x] Aynı açık verinin iki gönderimde farklı ciphertext ürettiği test edildi.
- [x] Doğru anahtarın veriyi eksiksiz açtığı round-trip testi yazıldı.
- [x] Yanlış anahtarın veriyi açamadığı test edildi.
- [x] Ciphertext'in tek bit değiştirilmesinde doğrulamanın başarısız olduğu test edildi.
- [x] IV veya additional authenticated data değiştirildiğinde açmanın başarısız olduğu test edildi.
- [x] Türkçe karakter, uzun metin ve boş isteğe bağlı alanlar round-trip testine alındı; emoji sınırı paket testleriyle kapsandı.
- [x] Maksimum paket boyutu, sabit ciphertext boyutu ve aşırı büyük/kanonik olmayan veri reddi test edildi.
- [x] Anahtar, plaintext ad, telefon ve e-postanın HTTP request payload'ında bulunmadığı Playwright ile doğrulandı.
- [x] Randevu kayıt ve e-posta hata yollarının yalnız allowlist kod logladığı test edildi; gerçek Next.js test sunucusunun stdout/stderr çıktısı E2E koşusunda e-posta, telefon, test kimliği, anahtar/payload alanı ve XSS işaretçisi sızıntısına karşı taranıyor.
- [x] Anahtar ve plaintext'in PostgreSQL kaydında bulunmadığı entegrasyon/E2E testiyle doğrulandı.
- [x] Anahtarın localStorage, sessionStorage, cookie, IndexedDB ve browser URL'sine yazılmadığı Chromium E2E testiyle doğrulandı.
- [x] Mevcut olmayan kayıt ile yanlış takip sırrının aynı cevabı verdiği ve rate limitin DB sorgusundan önce devreye girdiği test edildi.
- [ ] Admin panelinin ciphertext'i HTML'e kontrolsüz basmadığı doğrulanır.
- [x] XSS deneme payload'ının ağ/DB'de plaintext bulunmadığı E2E ile; çözme sonrası React tarafından yalnız inert metin render edildiği component testiyle doğrulandı.
- [ ] Bozuk/eski recovery ve boş yarıda kalan form E2E test edildi; kayıp anahtar ve QR tabanlı senaryolar henüz açık.
- [ ] Chrome, Firefox, Safari ve mobil tarayıcılarda Web Crypto uyumluluğu doğrulanır.
- [ ] Production build üzerinde CSP ihlali ve üçüncü taraf ağ isteği taraması yapılır.
- [ ] Bağımsız uzman kriptografik tasarım ve uygulama incelemesi yapar.

### P1 — Kullanıcı deneyimi ve yanlış anlaşılmayı önleme

- [ ] Formdan önce “kimliğiniz randevu onayından önce klinik tarafından görülemez” açıklaması gösterilir.
- [ ] Hangi alanların açık, hangilerinin şifreli olduğu form üzerinde ayrı ayrı belirtilir.
- [ ] Kullanıcıya “şifreli” ifadesinin cihaz ele geçirilmesi gibi tüm riskleri yok etmediği sade dille anlatılır.
- [ ] Anahtarın parola olmadığı ve yeniden üretilemeyeceği açıkça açıklanır.
- [ ] Anahtar kaybolursa başvurunun açılamayacağı ve durum takibinin kaybolabileceği belirtilir.
- [ ] Kullanıcı kurtarma belgesini indirmeden/güvenli kaydetmeden gönderim tamamlandı sayılmaz.
- [ ] Kurtarma belgesinde açık kişisel veri bulunmaz.
- [ ] QR yanında erişilebilir metin kodu alternatifi sunulur.
- [ ] Ekran okuyucu ve yalnız klavye kullanan kişiler anahtar kaydetme akışını tamamlayabilir.
- [ ] Kullanıcı ortak cihazdaysa dosyayı indirme ve yazdırma riskleri konusunda uyarılır.
- [ ] Başarı ekranında hassas bilgiler tekrar gösterilmez.
- [ ] Takip ekranı yanlış kod denemelerinde kayıt varlığını açığa çıkarmaz.
- [ ] Kullanıcı kendi şifreli kaydının silinmesini talep edebilecek anonim mekanizmaya sahip olur.

### P2 — Veri minimizasyonu, saklama ve operasyon

- [ ] Zorunlu olmayan her alan formdan kaldırılır.
- [ ] Serbest metin yerine sınırlı seçenekler tercih edilir.
- [ ] Açık metadata için alan bazlı saklama gerekçesi yazılır.
- [ ] Onaylanmamış talepler için kısa otomatik silme süresi belirlenir.
- [ ] Reddedilen, iptal edilen ve süresi geçen kayıtlar otomatik temizlenir.
- [ ] Onaylı ciphertext için gerekli en kısa saklama süresi belirlenir.
- [ ] Silme işlemi ciphertext, takip hash'i, ilişkili bildirim ve gereksiz audit metadata'yı kapsar.
- [ ] PostgreSQL yedeklerinin saklama süresi ana veri yaşam döngüsüyle uyumlu hâle getirilir.
- [ ] Silinen kaydın yedeklerde ne kadar süre kalabileceği KVKK metninde açıklanır.
- [ ] E-posta bildirimi ve log saklama süreleri ayrı belirlenir.
- [ ] Destek ekibi kullanıcıdan kişisel bilgi veya anahtar istemeden sorun çözebilecek prosedüre sahip olur.
- [ ] Klinik personeline anonim başvuru, anahtar ve yüz yüze açma eğitimi verilir.
- [ ] Yanlışlıkla anahtar paylaşılması veri ihlali prosedürüne bağlanır.
- [ ] Ekran görüntüsü, çıktı ve fiziksel notların saklanması için klinik içi politika hazırlanır.
- [ ] Yetkili roller üç ayda bir gözden geçirilir.

### P2 — KVKK, şeffaflık ve hukuki kontrol

- [ ] Veri akışı ve şifreleme modeli hukuk danışmanına teknik olarak doğru biçimde anlatılır.
- [ ] Aydınlatma metni şifreli ve açık tutulan veri kategorilerini ayrı listeler.
- [ ] İşleme amacı, hukuki sebep, saklama süresi ve alıcı grupları gerçek mimariyle eşleştirilir.
- [ ] “Uçtan uca şifreleme”, “anonim” ve “kimliksiz” ifadeleri teknik olarak doğru değilse kullanılmaz.
- [ ] IP, zaman, hizmet tercihi ve takip kayıtlarının kişisel veri sayılabileceği hesaba katılır.
- [ ] Şifreleme yapılmasının KVKK yükümlülüklerini ortadan kaldırmadığı kabul edilir.
- [ ] Kullanıcının erişim, silme ve düzeltme taleplerinin kimlik açıklamadan nasıl doğrulanacağı belirlenir.
- [ ] Acil durum ve kendine/başkasına zarar riski içeren başvurular için hukuki ve etik sınırlar belirlenir.
- [ ] Hosting, PostgreSQL, hata izleme ve e-posta sağlayıcılarının ciphertext/metadata erişimi envantere yazılır.
- [ ] Yurt dışı aktarım değerlendirmesi ciphertext ve metadata ayrımıyla yapılır.
- [ ] Veri ihlali prosedürüne anahtar, ciphertext ve metadata sızıntısı senaryoları eklenir.
- [ ] Production öncesinde hukuk onayı ve teknik davranış karşılaştırılarak tutarlılık kontrolü yapılır.

### P3 — İleri seviye iyileştirmeler

- [ ] Kullanıcının birden fazla cihazda güvenli takip yapabilmesi için anahtarı sunucuya vermeyen aktarım yöntemi araştırılır.
- [ ] QR içeriği için hata düzeltme, sürüm ve checksum tasarlanır.
- [ ] Paket boyutunu gizlemek için sınıflandırılmış padding uygulanabilirliği değerlendirilir.
- [ ] Yönetici onay sırasının zaman korelasyonu riskini azaltacak toplu bildirim yaklaşımı değerlendirilir.
- [ ] Anahtarların donanım destekli saklanması/WebAuthn tabanlı alternatifler araştırılır.
- [ ] İki kişinin birlikte onayı olmadan çözme yapılamayan çift kontrol modeli değerlendirilir.
- [ ] Klinik cihazında kiosk/izole profil ve disk şifreleme kullanılır.
- [ ] Düzenli gizlilik etki değerlendirmesi ve yıllık kriptografi incelemesi planlanır.

### Gizlilik mimarisi çıkış kriterleri

- [x] Chromium E2E ağ kaydında hassas alanların açık hâli veya çözme anahtarı bulunmuyor.
- [x] PostgreSQL gizlilik denetiminde hassas alanların açık hâli veya çözme anahtarı bulunmuyor.
- [ ] Sunucu ve yönetici, kullanıcı anahtarı olmadan ciphertext'i çözemiyor.
- [x] Yönetici kimliği açmadan talebi onaylayıp tarih önerebildi ve ayrı negatif E2E akışında talebi reddedebildi.
- [x] Kullanıcı takip sırrıyla onay durumunu ve önerilen zamanı güvenli biçimde görebiliyor.
- [x] Yüz yüze açmanın yalnız tarayıcıda gerçekleştiği, çözme anahtarının POST gövdelerine girmediği ve açık verinin tekrar kaydedilmediği Chromium E2E testiyle doğrulandı.
- [x] Yanlış anahtar/tamper kripto testleri ve bozuk recovery Chromium E2E testi güvenli biçimde sonuçlandı.
- [ ] Log, e-posta, analitik, audit ve hata izleme sistemlerine açık hassas veri gitmiyor.
- [x] Eski plaintext veri modeli kaldırıldı; onaylanan yerel test kaydı silindi ve şema denetimi geçti.
- [ ] Otomatik testler, E2E testleri, bağımsız güvenlik incelemesi ve hukuk onayı tamamlanmış.
- [ ] Kullanıcı metinleri sistemin sağlayamadığı bir gizlilik garantisi vermiyor.

Teknik referanslar: [OWASP Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html), [OWASP Key Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Key_Management_Cheat_Sheet.html), [MDN Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API).

## 1. Öncelikli teknik işler

- [ ] Resend hesabı ve production API anahtarı hazırlanır.
- [ ] Resend gönderici alan adı doğrulanır.
- [ ] `RESEND_API_KEY`, `APPOINTMENT_NOTIFICATION_TO` ve `EMAIL_FROM` production ortamına eklenir.
- [ ] Gerçek bir randevu talebiyle kayıt ve e-posta bildirimi birlikte test edilir.
- [ ] Başarısız e-posta bildirimlerinin yeniden deneme işlemi zamanlanır.
- [ ] Yönetici hesabına uygulama seviyesinde MFA/iki aşamalı doğrulama eklenir.
- [ ] Yönetici ve altyapı sağlayıcısı hesaplarında MFA etkinleştirilir.

## 2. Otomatik testlerin tamamlanması

- [x] Playwright ve yerel Chromium test tarayıcısı kuruldu; Windows'ta temiz kapanan test runner eklendi.
- [ ] Ana sayfa ve temel navigasyon için E2E testi yazılır.
- [x] Randevu formunun başarılı gönderim, boş form, çevrimdışı retry, bozuk/eski recovery ve replay E2E testleri yazıldı.
- [x] Yönetici başarısız giriş, başarılı giriş, korunan sayfaya erişim, hash'li oturum kaydı, çıkış ve oturum iptali Chromium E2E testi yazıldı.
- [x] Anonim takip, admin görüntüleme/onay/tarih önerisi, yüz yüze çözme ve kullanıcı iptali yaşam döngüsü Chromium E2E testi yazıldı.
- [ ] Makale oluşturma, düzenleme, yayımlama ve arşivleme E2E testi yazılır.
- [x] Gerçek HTTP ve test PostgreSQL kullanılarak auth/oturum entegrasyon testi tamamlandı.
- [ ] Süresi dolmuş ve iptal edilmiş oturumların korunan sayfalara erişemediği doğrulanır.
- [ ] Production benzeri veri üzerinde migration yükseltme provası yapılır.
- [ ] Boş veritabanından en güncel şemaya migration işlemi staging ortamında doğrulanır.

## 3. Manuel kalite kontrolü

- [ ] Ana sayfa ve tüm navigasyon bağlantıları tek tek kontrol edilir.
- [ ] İletişim ve randevu formu klavyeyle kullanılabilirlik açısından test edilir.
- [ ] Form hata mesajları ekran okuyucuyla kontrol edilir.
- [ ] Çevrimdışı gönderim güvenli biçimde durdurulup aynı bellek içi paketle retry edildi; yavaş ağ ve POST başladıktan sonra kopma senaryosu açık.
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
