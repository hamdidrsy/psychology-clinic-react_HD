# Mobil Öncelikli Düşük Sadakatli Wireframe’ler

- Durum: Taslak — gerçek içerik ve klinik onayı bekliyor
- Amaç: Görsel tasarımdan önce içerik sırası, CTA, responsive davranış ve durumları doğrulamak

Kutular yerleşimi temsil eder; renk, font ve kesin ölçü belirtmez. Mobilde tek sütun esastır. Masaüstünde içerik sırası korunarak uygun bölümler iki/üç sütuna açılır.

## 1. Ortak mobil kabuk

```text
┌──────────────────────────────┐
│ [Logo/Ad]     [Talep] [Menü] │
├──────────────────────────────┤
│ [Skip link hedefi: main]     │
│                              │
│ SAYFA İÇERİĞİ                │
│                              │
├──────────────────────────────┤
│ Kısa uzman/klinik bilgisi    │
│ Hızlı bağlantılar            │
│ İletişim                     │
│ KVKK · Gizlilik · Çerez      │
│ Acil durum notu              │
└──────────────────────────────┘
```

Masaüstü: logo solda, ana navigasyon ortada/sağda, birincil CTA sağ uçta. Footer dört kolona açılabilir; okuma sırası DOM sırasıyla korunur.

## 2. Ana sayfa

```text
┌──────────────────────────────┐
│ H1: Açık değer önerisi       │
│ Kısa, etik destek metni      │
│ [Randevu talebi]             │
│ [Hizmetleri incele]          │
│ [Onaylı uzman fotoğrafı]     │
├──────────────────────────────┤
│ Güven/doğrulanmış profil     │
│ Unvan · yaklaşım · konum     │
├──────────────────────────────┤
│ H2 Hizmetler                 │
│ [Hizmet kartı]               │
│ [Hizmet kartı]               │
│ [Tüm hizmetler]              │
├──────────────────────────────┤
│ H2 Nasıl ilerliyoruz?        │
│ 1 Bilgi al  2 Talep  3 Dönüş│
├──────────────────────────────┤
│ H2 Hakkımda + kısa biyografi │
│ [Daha fazla]                 │
├──────────────────────────────┤
│ H2 Seçili makaleler          │
│ [Makale kartları]            │
├──────────────────────────────┤
│ H2 Sık sorulanlar            │
│ [3–5 soru] [Tüm SSS]         │
├──────────────────────────────┤
│ Son CTA + kesin randevu notu │
└──────────────────────────────┘
```

Masaüstü: hero metin/görsel iki kolon; hizmetler üç kolon; süreç yatay adımlar. Mobilde görsel metnin ardından gelir ve LCP bütçesine uygun optimize edilir.

## 3. Hizmetler ve hizmet detayı

```text
HİZMETLER                         HİZMET DETAYI
┌──────────────────────────────┐  ┌──────────────────────────────┐
│ H1 Hizmetler                 │  │ Breadcrumb                   │
│ Açıklama ve etik sınır       │  │ H1 Hizmet adı                │
├──────────────────────────────┤  │ Kısa, doğrulanmış özet       │
│ [Hizmet adı]                 │  │ [Randevu talebi]             │
│ Kısa kapsam · [İncele]       │  ├──────────────────────────────┤
│ [Hizmet adı]                 │  │ H2 Kapsam                     │
│ Kısa kapsam · [İncele]       │  │ H2 Kimler için                │
├──────────────────────────────┤  │ H2 Süreç                      │
│ Süreç / önemli sınırlar      │  │ H2 Sınırlar / acil durum     │
├──────────────────────────────┤  ├──────────────────────────────┤
│ İlgili SSS                   │  │ İlgili SSS ve makaleler      │
│ [Talep oluştur]              │  │ [Talep oluştur]              │
└──────────────────────────────┘  └──────────────────────────────┘
```

Masaüstünde hizmet listesi kart grid’ine açılır. Detayda ana içerik ve yapışkan olmayan kısa CTA yan paneli kullanılabilir; DOM’da CTA içerik sonrasında da erişilebilir olmalıdır.

## 4. Makaleler ve makale detayı

```text
MAKALELER                         MAKALE DETAYI
┌──────────────────────────────┐  ┌──────────────────────────────┐
│ H1 Makaleler                 │  │ Breadcrumb                   │
│ Bilgilendirme amacı notu     │  │ H1 Makale başlığı            │
│ [Kategori filtresi?]         │  │ Özet · Yazar · Tarihler      │
├──────────────────────────────┤  ├──────────────────────────────┤
│ [Görsel] Başlık              │  │ İçindekiler (uzunsa)         │
│ Özet · tarih · [Oku]         │  │ Makale içeriği               │
│ [Görsel] Başlık              │  │ H2/H3...                     │
│ Özet · tarih · [Oku]         │  │ Kaynaklar                    │
├──────────────────────────────┤  │ Güncelleme notu              │
│ [Önceki] Sayfa N [Sonraki]   │  ├──────────────────────────────┤
└──────────────────────────────┘  │ İlgili hizmet/makaleler      │
                                  │ [Uygun hizmeti incele]       │
                                  └──────────────────────────────┘
```

Okuma kolonu masaüstünde yaklaşık 65–75 karakter satır uzunluğunu hedefler. Paylaş butonu kritik içeriğin önüne geçmez.

## 5. İletişim ve randevu

```text
┌──────────────────────────────┐
│ H1 İletişim ve randevu       │
│ Bu bir taleptir; kesin       │
│ randevu değildir.            │
│ Geri dönüş süresi: [onaylı]  │
├──────────────────────────────┤
│ Telefon / E-posta / Adres    │
│ Çalışma saatleri             │
├──────────────────────────────┤
│ H2 Randevu talep formu       │
│ Ad soyad *                   │
│ [________________________]   │
│ E-posta / Telefon (biri *)   │
│ [________________________]   │
│ Tercih edilen iletişim *     │
│ ( ) Telefon ( ) E-posta      │
│ Hizmet [Seçiniz__________]   │
│ Kısa not (özel bilgi uyarısı)│
│ [________________________]   │
│ [KVKK metnine erişim/teyit]  │
│ [Talebi gönder]              │
│ Gönderim durumu alanı        │
├──────────────────────────────┤
│ Ulaşım/harita (mahremiyetli) │
│ Acil/kriz yönlendirmesi      │
└──────────────────────────────┘
```

Masaüstünde iletişim bilgisi ve form iki kolona ayrılabilir. Form DOM’da ana içerik sırasını korur. Başarı/hata aynı canlı bölgede duyurulur; başarı sonrası alanlar kaybolsa bile başlık ve sonraki adım görünür kalır.

## 6. SSS ve yasal sayfa

```text
SSS                               YASAL METİN
┌──────────────────────────────┐  ┌──────────────────────────────┐
│ H1 Sık sorulan sorular       │  │ H1 Belge adı                 │
│ Kısa açıklama                │  │ Yürürlük / sürüm             │
│ [Kategori bağlantıları]      │  │ İçindekiler                  │
├──────────────────────────────┤  ├──────────────────────────────┤
│ [v] Soru                     │  │ H2 Veri sorumlusu / amaç...  │
│     Açık yanıt + bağlantı    │  │ Okunabilir hukuki içerik     │
│ [>] Soru                     │  │ H2 Başvuru / tercih          │
│ [>] Soru                     │  │ İletişim kanalı              │
├──────────────────────────────┤  └──────────────────────────────┘
│ Eksik sorunuz mu var?        │
│ [İletişime geç]              │
└──────────────────────────────┘
```

Accordion kullanılırsa buton semantiği, `aria-expanded`, benzersiz panel ilişkisi ve klavye davranışı sağlanır. Yasal metinlerde accordion kullanılmaz; içerik yazdırılabilir ve kalıcı bağlantılanabilir başlıklara ayrılır.

## 7. Admin ekranları

```text
MOBİL TALEP LİSTESİ               MASAÜSTÜ PANEL
┌──────────────────────────────┐  ┌───────┬──────────────────────┐
│ [Menü] Randevu talepleri     │  │ Menü  │ Başlık + kullanıcı   │
│ [Durum] [Tarih]              │  │       ├──────────────────────┤
├──────────────────────────────┤  │ Özet  │ Metrik kartları      │
│ Yeni · TR-XXXX               │  │ Talep │ Yeni talepler tablosu│
│ Ad · tarih · [Aç]            │  │ Makale│ Son makaleler        │
│ İletişildi · TR-XXXX         │  │       │ Sistem uyarıları     │
│ Ad · tarih · [Aç]            │  └───────┴──────────────────────┘
├──────────────────────────────┤
│ [Önceki] 1/… [Sonraki]       │
└──────────────────────────────┘
```

- Mobil admin; giriş, talep listeleme/detay ve durum güncellemeyi tam destekler.
- Zengin makale düzenleme mobilde erişilebilir kalır ancak birincil hedef ≥ 768 px tablet/masaüstüdür; küçük ekranda veri kaybı veya engelleyici modal oluşmaz.
- Masaüstü tablolar mobilde yatay sürüklemeye zorlanmak yerine kart/özet görünümüne dönüşür.
- Kişisel bilgi liste ekranında minimize edilir; ayrıntı yalnız detay sayfasında gösterilir.

## 8. Sistem durumları

| Durum                  | Tasarım davranışı                                                                                              |
| ---------------------- | -------------------------------------------------------------------------------------------------------------- |
| Yükleniyor             | Statik/server-render içerikte gereksiz spinner yok; uzun işlemde adlandırılmış durum veya şekli sabit skeleton |
| Boş liste              | Neden ve sonraki eylem: “Henüz makale yok — Yeni makale oluştur”; randevuda nötr mesaj                         |
| Alan hatası            | Alan altında metin + hata özeti; renk yanında ikon/metin; ilk hataya programlı odak                            |
| Sistem hatası          | Ne olduğu, kullanıcının ne yapabileceği ve destek yolu; teknik ayrıntı/kişisel veri yok                        |
| Başarı                 | Kısa başlık, tamamlanan eylem ve sonraki adım; `role=status`/uygun canlı bölge                                 |
| 404                    | Aranan içeriğin bulunamadığı açıklaması; ana sayfa, hizmetler ve makaleler bağlantıları                        |
| 500/global hata        | Güvenli genel mesaj, yeniden dene ve ana sayfa; olay referansı varsa kişisel veri içermez                      |
| Offline/ağ kesintisi   | Form gönderilmediyse açıkça söyler; otomatik tekrar çift kayıt üretmez                                         |
| Yetkisiz/oturum süresi | Admin girişe güvenli dönüş; kaydedilmemiş içerik riski önceden bildirilir                                      |

## 9. Tasarım onayı kontrolü

- [ ] Gerçek içerikle ana sayfa, hizmet detayı, makale detayı ve iletişim mobil wireframe’i klinik sahibi tarafından onaylandı.
- [ ] Masaüstü dönüşümü içerik sorumlusu tarafından onaylandı.
- [ ] CTA ve acil durum dili klinik/hukuk tarafından onaylandı.
- [ ] Admin mobil sınırları proje sahibi tarafından onaylandı.
