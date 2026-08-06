# Bilgi Mimarisi ve Kullanıcı Akışları

- Durum: Taslak — klinik/içerik onayı bekliyor
- Tarih: 2026-08-06
- Dayanak: `docs/discovery-and-requirements.md`

## 1. Site haritası

```text
/
├── /hakkimda
├── /hizmetler
│   └── /hizmetler/[slug]
├── /makaleler
│   └── /makaleler/[slug]
├── /sik-sorulan-sorular
├── /iletisim
│   └── talep sonucu (tercihen aynı sayfada; ayrı URL olursa noindex)
├── /kvkk-aydinlatma-metni
├── /gizlilik-politikasi
├── /cerez-politikasi
└── /admin                         [noindex, auth korumalı]
    ├── /admin/giris
    ├── /admin/makaleler
    │   ├── /admin/makaleler/yeni
    │   └── /admin/makaleler/[id]
    └── /admin/randevu-talepleri
        └── /admin/randevu-talepleri/[id]
```

Sistem yolları arasında 404, global hata, auth callback, sitemap ve robots bulunur. Taslak/preview URL’leri herkese açık navigasyonda gösterilmez ve indexlenmez.

## 2. URL ve slug kuralları

- Herkese açık yollar Türkçe fakat ASCII karakterli olur: `hakkimda`, `iletisim`, `sik-sorulan-sorular`.
- Slug; küçük harf, Latin/ASCII karakter, rakam ve tek tire içerir. Boşluklar tireye çevrilir; ardışık/başta/sonda tire bulunmaz.
- Türkçe dönüşüm: `ç→c`, `ğ→g`, `ı→i`, `İ→i`, `ö→o`, `ş→s`, `ü→u`.
- Makale/hizmet slug’ı kısa, anlamlı ve benzersiz olur; tarih, gereksiz bağlaç ve değişken pazarlama ifadesi eklenmez.
- URL’de sorgu; yalnız filtre/sayfalama gibi geçici görünüm durumu için kullanılır. Canonical liste URL’sine işaret eder.
- Yayınlanmış slug değiştirilirse eski URL kalıcı `308` redirect ile yeni URL’ye gider ve redirect geçmişi saklanır.
- Silinen içerik için birebir karşılık varsa `308`; yoksa gerçek `404`/gerektiğinde `410` kullanılır. Ana sayfaya toplu redirect yapılmaz.
- URL’lerde kişisel veri, e-posta, telefon, veritabanı sıralı kimliği veya gizli token bulunmaz.
- Trailing slash politikası Next.js yapılandırmasında tek biçimde uygulanır; canonical bununla aynı olur.

## 3. Navigasyon modeli

### Masaüstü header

Sıra: Logo/ana sayfa → Hakkımda → Hizmetler → Makaleler → SSS → İletişim → “Randevu Talebi” birincil CTA.

- Logo ana sayfaya döner ve erişilebilir adı klinik/uzman adını içerir.
- Aktif sayfa `aria-current="page"` ile belirtilir; yalnız renge dayanmaz.
- “Randevu Talebi” `/iletisim#randevu-formu` hedefine gider.
- Admin bağlantısı herkese açık ana navigasyonda yer almaz; footer’da da gösterilmesi gerekmez.
- Header sticky olabilir; küçük ekran yüksekliğini kaplamamalı ve anchor hedeflerini örtmemelidir.

### Mobil menü

- Header’da logo, randevu CTA’sı için kısa çözüm ve “Menüyü aç” düğmesi bulunur.
- Menü modal/drawer olarak açılırsa focus içine taşınır, Tab odağı sınırlandırılır ve kapanınca tetikleyiciye döner.
- Escape, kapat düğmesi ve menü bağlantısı seçimi menüyü kapatır.
- Arka plan etkileşimi engellenir; scroll kilidi sayfa konumunu bozmaz.
- 320 px genişlikte bağlantılar kesilmez, yatay kayma olmaz.

### Footer

1. Uzman/klinik kısa kimliği ve bilgilendirme amacı notu.
2. Hızlı bağlantılar: Hakkımda, Hizmetler, Makaleler, SSS.
3. İletişim: doğrulanmış telefon/e-posta/adres/çalışma saatleri.
4. Yasal: KVKK Aydınlatma, Gizlilik, Çerez ve varsa çerez tercihlerini açma.
5. Acil/kriz yönlendirmesi: yalnız klinik ve hukuk onaylı metin.
6. Telif, yürürlük yılı ve sosyal bağlantılar.

### İçerik içi bağlantılar

- Hizmet detayı → ilgili makaleler, ilgili SSS ve randevu formu.
- Makale detayı → ilgili hizmet, diğer kaynaklı makaleler ve uygun olduğunda randevu CTA’sı.
- SSS yanıtı → ayrıntılı hizmet/yasal sayfa; accordion başlığı bağlantı yerine kullanılmaz.
- Hakkımda → hizmetler ve randevu talebi.
- Breadcrumb: detay sayfalarında `Ana Sayfa > Bölüm > Başlık`; mevcut sayfa bağlantı değildir.
- Bağlantı metni “buraya tıklayın” değil hedefi açıklar.

## 4. Sayfa içerik hiyerarşileri

| Sayfa               | İçerik sırası                                                                                           | Birincil CTA                 | İkincil CTA                 |
| ------------------- | ------------------------------------------------------------------------------------------------------- | ---------------------------- | --------------------------- |
| Ana sayfa           | Hero → güven/doğrulanmış profil özeti → hizmetler → yaklaşım/süreç → seçili makaleler → SSS → iletişim  | Randevu talebi oluştur       | Hizmetleri incele           |
| Hakkımda            | Başlık/özet → biyografi → eğitim/uzmanlık → yaklaşım → etik sınırlar → çalışma biçimi                   | Randevu talebi oluştur       | Hizmetleri incele           |
| Hizmetler           | Başlık/açıklama → hizmet kartları → süreç/sınırlar → SSS → CTA                                          | Uygun hizmeti incele         | Randevu talebi oluştur      |
| Hizmet detayı       | Breadcrumb → başlık/özet → kapsam → kimler için → süreç → kapsam dışı/acil durum → ilgili SSS/makaleler | Randevu talebi oluştur       | Diğer hizmetler             |
| Makaleler           | Başlık/amaç → kategori/filtre (gerekirse) → makale listesi → sayfalama                                  | Makaleyi oku                 | Hizmetleri incele           |
| Makale detayı       | Breadcrumb → başlık/özet/yazar/tarih → içerik/içindekiler → kaynaklar → güncelleme notu → ilgili içerik | İlgili hizmeti incele        | Diğer makaleler             |
| SSS                 | Başlık/çerçeve → kategori grupları → sorular → eksik soru yönlendirmesi → kriz/yasal not                | İletişime geç                | Hizmetleri incele           |
| İletişim            | Başlık → talebin niteliği/geri dönüş süresi → iletişim kartları → form → KVKK notu → harita/ulaşım      | Talebi gönder                | Telefon/e-posta (onaylıysa) |
| KVKK/Gizlilik/Çerez | Başlık → sürüm/yürürlük → içindekiler → yapılandırılmış hukuki içerik → başvuru/tercih kanalı           | İlgili kişi başvurusu/tercih | İletişim                    |
| Admin dashboard     | Başlık → yeni talepler özeti → işlem bekleyenler → son makaleler → sistem uyarıları                     | Yeni talepleri gör           | Makale oluştur              |
| Admin makaleler     | Başlık → yeni makale → filtre → tablo/kart listesi → sayfalama                                          | Yeni makale                  | Seçileni düzenle            |
| Admin talepler      | Başlık → durum/tarih filtresi → liste → sayfalama                                                       | Talebi aç                    | Durumu güncelle             |

Her sayfada tek görünür H1 bulunur. CTA metni sonuç doğuruyormuş gibi “Randevu al” değil, “Randevu talebi oluştur” der.

## 5. Kritik kullanıcı akışları

### Randevu talebi

```text
Hizmet/ana sayfa/makale
  → İletişim ve randevu sayfası
  → Talep niteliği + geri dönüş süresini oku
  → Alanları doldur
  → İstemci doğrulaması
      ├─ Hata → ilgili alana odak + düzeltme
      └─ Geçerli → gönder
          → Sunucu doğrulama + bot/rate limit
              ├─ Alan hatası → formda düzelt
              ├─ Rate limit → bekleme mesajı; kayıt yok
              ├─ Sistem hatası → güvenli hata; yeniden deneme
              └─ Geçerli → DB kaydı
                  → Bildirim işi
                  → “Talep alındı; kesin randevu değildir”
```

Başarı durumunda geri/yenile işlemi yeni kayıt üretmemelidir. Başarı ekranı talep referansını gösterebilir; kişisel veri göstermez.

### Makale keşfi ve okuma

```text
Arama motoru / Ana sayfa / İlgili hizmet
  → Makale listesi veya detay
  → Başlık, yazar, tarih ve özeti değerlendir
  → İçeriği oku / içindekilerle ilerle
  → Kaynakları ve güncellenme tarihini gör
  → İlgili makale veya hizmete geç
  → Uygunsa randevu talebine geç
```

Makale CTA’sı kullanıcıyı korku veya tanı varsayımıyla yönlendirmez.

### Yönetici girişi ve randevu yönetimi

```text
/admin isteği
  → Oturum yok → /admin/giris
  → Kimlik doğrula
      ├─ Hata/rate limit → genel güvenli mesaj
      └─ Başarılı → güvenli callback veya dashboard
          → Yeni talepler
          → Filtrele ve talebi aç
          → İletişim bilgisini yetki dahilinde gör
          → Durumu güncelle
          → Audit log + başarı mesajı
```

### Yönetici makale akışı

```text
Admin → Makaleler → Yeni/Düzenle
  → İçerik + SEO + görsel/alt metin
  → Doğrula
      ├─ Hata → alanlara dön
      └─ Geçerli → Taslak kaydet
          → Güvenli, noindex önizleme
          → Yayınla onayı
          → Cache/revalidation + sitemap güncellemesi
```

## 6. SEO ve içerik bulma ilişkileri

- Her indexlenebilir sayfa en az bir başka indexlenebilir sayfadan normal HTML bağlantısı alır.
- Hizmet ve makale taksonomisi gerçek içerik sayısı oluşmadan gereksiz kategori sayfaları üretmez.
- Boş kategori, iç arama sonucu, admin, preview ve form sonucu indexlenmez.
- Breadcrumb görsel hiyerarşiyle ve `BreadcrumbList` yapılandırılmış verisiyle tutarlı olur.
- FAQ yapılandırılmış verisi yalnız ekranda aynı içerik görünüyorsa eklenir.

## 7. Onay noktaları

- Ana navigasyon adları ve sırası.
- “İletişim” ile “Randevu Talebi”nin aynı sayfada olması.
- Hizmet ve makale gerçek adları geldikten sonra slug listesi.
- Footer’daki iletişim, acil/kriz ve hukuki metinler.
- CTA dili ve klinik geri dönüş süresi.
- Admin’in mobilde yalnız hızlı durum güncelleme mi, tam makale düzenleme mi destekleyeceği.
