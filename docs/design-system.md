# Tasarım Sistemi Spesifikasyonu

- Durum: Geçici temel — logo, marka ve klinik sahibi onayı bekliyor
- Yaklaşım: Derin Deniz Mavisi temelli, güven veren, profesyonel ve katmanlı; “hastane soğukluğu” veya aşırı dekoratif wellness dili olmadan

Bu değerler uygulama aşamasında CSS/Tailwind token’larına dönüştürülecektir. Marka materyali geldiğinde token isimleri korunarak değerler değiştirilebilir.

## 1. Tasarım ilkeleri

1. **Güvenilir:** İddia yerine doğrulanmış bilgi, tutarlı hiyerarşi ve açık kaynaklar.
2. **Sakin:** Yeterli boşluk, sınırlı renk, gereksiz animasyon ve aciliyet baskısı yok.
3. **Erişilebilir:** WCAG 2.2 AA, görünür focus, güçlü kontrast ve büyütülebilir metin.
4. **İnsan odaklı:** Doğal dil ve gerçek/onaylı görseller; stok klişelerinden kaçınma.
5. **Hızlı:** Görsel efekt ve üçüncü taraf script yerine içerik ve sistem fontu/self-host font önceliği.

## 2. Renk token’ları — öneri

| Token           | Geçici değer | Kullanım                                        |
| --------------- | ------------ | ----------------------------------------------- |
| `canvas`        | `#F7F9FC`    | Sayfa zemini                                    |
| `surface`       | `#FFFFFF`    | Kart, form ve yükseltilmiş yüzey                |
| `surface-muted` | `#E9EEF5`    | Katman ve sakin bölüm ayrımı                    |
| `text`          | `#152238`    | Ana metin                                       |
| `text-muted`    | `#46566D`    | İkincil metin; küçük metinde ayrıca test edilir |
| `primary`       | `#1D3557`    | Derin Deniz Mavisi; güven ve ana vurgu          |
| `primary-hover` | `#13243D`    | Hover/active ve daha derin yüzey                |
| `on-primary`    | `#FFFFFF`    | Primary üstü metin                              |
| `link`          | `#1D4F7A`    | Metin bağlantısı; alt çizgiyle                  |
| `border`        | `#B7C2D0`    | Alan/kart sınırı                                |
| `focus`         | `#B24F00`    | Focus halkası; offset ile                       |
| `success`       | `#176B45`    | Başarı; ikon/metinle                            |
| `warning`       | `#805500`    | Uyarı; ikon/metinle                             |
| `danger`        | `#A32626`    | Hata; ikon/metinle                              |

- Renk tek başına anlam taşımaz. Hata/başarı durumunda ikon, başlık ve açıklama bulunur.
- Nihai kombinasyonlar normal metinde en az 4.5:1, büyük metinde 3:1; bileşen sınırı/focus için en az 3:1 hedefiyle araçla doğrulanır.
- 6 Ağustos 2026 token doğrulaması: `primary/on-primary` 12.36:1, `text/canvas` 15.11:1, `text-muted/canvas` 7.08:1 ve `link/canvas` 8.12:1. Tümü normal metin için WCAG AA eşiğini karşılar.
- Fotoğraf üzerine metin yalnız sabit ve test edilmiş overlay ile yerleştirilir; tercih düz yüzeydir.
- Koyu mod ilk sürüm kapsamı dışıdır.

## 3. Tipografi

- Başlık: okunabilir, Türkçe karakter seti tam, self-host edilebilen tek aile; marka seçimi bekleniyor.
- Gövde: aynı aile veya performans için sistem sans-serif stack.
- Temel gövde boyutu 16 px altına düşmez; uzun metinlerde 18 px/1.7 line-height tercih edilir.
- Modüler ölçek önerisi: `14, 16, 18, 20, 24, 30, 38, 48, 60` px; mobil H1 `38`, geniş ekranda en fazla `60`.
- Satır uzunluğu makalede 65–75 karakter, diğer açıklamalarda yaklaşık 55–70 karakter.
- Büyük harfli uzun metin, çok ince font ağırlığı ve justified hizalama kullanılmaz.
- Kullanıcı zoom yaptığında metin kesilmez; sabit yükseklikli metin kutularından kaçınılır.

## 4. Boşluk, grid ve kırılım

- Temel boşluk birimi 4 px; token dizisi: `4, 8, 12, 16, 24, 32, 48, 64, 80, 96`.
- İçerik container’ı en fazla 1200 px; okuma container’ı yaklaşık 720 px.
- Mobil kenar boşluğu 16 px, ≥640 px’de 24 px, geniş ekranda 32 px.
- Grid: mobil 4 kolon, tablet 8 kolon, masaüstü 12 kolon; bileşen uygulaması CSS grid/flex ihtiyacına göre.
- Kırılım davranışı içerikle test edilir; önerilen teknik eşikler `640`, `768`, `1024`, `1280` px.
- Bölüm dikey boşluğu mobilde 48–64 px, masaüstünde 72–96 px; metin ölçeklendiğinde kırpılmaz.

## 5. Şekil, sınır ve gölge

- Radius: alan/küçük kontrol 8 px; kart 12–16 px; pill yalnız etiket/filtre gibi semantik yerde.
- Sınır: varsayılan 1 px; form focus yalnız renk değil 2–3 px dış halka ile görünür.
- Sayfa derinliği; açık mavi-gri katmanlar, ince sınırlar ve mavi tonlu yumuşak gölgelerle kurulur. Kartlar yüzeyden belirgin fakat sakin biçimde ayrılır; modal/dropdown daha derin gölge kullanır.
- Tıklanabilir olmayan kartlar düğme gibi hover davranışı göstermez.

## 6. Hareket

- İşlevsel geçişler 120–200 ms; büyük içerik geçişleri en fazla 300 ms.
- Animasyon kullanıcı eylemine cevap veya durum değişimini anlatır; dekoratif sürekli hareket yoktur.
- `prefers-reduced-motion: reduce` altında kaydırma ve dönüşüm animasyonları kaldırılır/çok kısaltılır.
- Otomatik carousel, parallax, yanıp sönme ve içerik kaymasına yol açan giriş animasyonları kullanılmaz.

## 7. Bileşen durumları

### Düğme

- Varyantlar: primary, secondary, text/link, danger (yalnız admin kritik işlem).
- Durumlar: default, hover, active, focus-visible, disabled, loading.
- Loading durumunda genişlik değişmez, işlem adı erişilebilir kalır ve tekrar tıklama engellenir.
- Disabled yerine mümkünse eylem açık tutulup doğrulama açıklanır; gerçekten disabled ise nedeni yakınında yazılır.

### Bağlantı

- Gövde içi bağlantı varsayılan alt çizgilidir; hover/focus yalnız renk değişimine dayanmaz.
- Yeni sekme yalnız kullanıcı bağlamını korumak için gerekliyse kullanılır ve erişilebilir olarak belirtilir.

### Form alanı

```text
Kalıcı label *
Kısa yardım/açıklama (gerekiyorsa)
[ Girdi                              ]
Hata metni / sayaç / format örneği
```

- Placeholder label yerine geçmez.
- Zorunluluk form başında açıklanır ve alan label’ında tutarlı gösterilir.
- Hata; `aria-invalid`, `aria-describedby` ve görünür metinle bağlanır.
- Form gönderiminde hata özeti başlığa sahip olur; odağı alır ve alan bağlantıları içerir.
- Yardım ve hata aynı anda varsa ikisi de açıklama ilişkisine dahil edilir.
- Tarayıcı autocomplete değerleri ad, e-posta ve telefon için doğru tanımlanır.
- Başarı mesajı formun üstünde/yerinde canlı bölgeyle duyurulur ve kesin randevu olmadığını tekrarlar.

## 8. Klavye ve odak davranışı

- Sayfanın ilk odaklanabilir öğesi görünür olduğunda “Ana içeriğe geç” skip linkidir.
- Focus sırası DOM ve görsel okuma sırasıyla aynıdır; pozitif `tabindex` kullanılmaz.
- Focus halkası hiçbir reset/overflow nedeniyle kesilmez.
- Header anchor hedeflerinde `scroll-margin-top` kullanılır.
- Mobil menü/dialog açıldığında ilk anlamlı kontrole odak gider; focus içeride kalır; Escape kapatır; kapanınca tetikleyiciye döner.
- Modal olmayan açılır menü gereksiz ARIA menu kalıbı kullanmaz; normal link listesi tercih edilir.
- Accordion başlıkları gerçek button’dır; Enter/Space çalışır, durum `aria-expanded` ile bildirilir.
- Toast tek hata kanalı değildir; kaybolmadan önce işlem sonucu sayfada erişilebilir kalır.

## 9. Görsel kuralları

- Uzman/klinik görselleri gerçek, güncel, izinli ve profesyonel olmalıdır.
- Danışan/hasta çağrışımı yapan tanımlanabilir kişi görseli açık ve belgeli izin olmadan kullanılmaz.
- Dekoratif görsel boş `alt`; anlamlı görsel kısa ve bağlama uygun alt metin alır.
- Aynı bilgi alt metin ve yakındaki caption’da gereksiz tekrar edilmez.
- En-boy oranı kaynak bazında sabitlenir: portre önerisi 4:5, makale kapak 16:9 veya 3:2; layout shift önlenir.
- SVG logo erişilebilir ada sahip bağlantı içinde kullanılır; dekoratif SVG’ler assistive technology’den gizlenir.

## 10. Admin kullanım sınırları

- Masaüstü/tablet, uzun makale düzenleme ve toplu inceleme için birincil deneyimdir.
- Mobilde giriş, dashboard, talep liste/detay ve durum değiştirme eksiksiz çalışır.
- Makale düzenleme mobilde açılabilir/kaydedilebilir; araç çubuğu taşmaz. Ancak karmaşık görsel düzenleme mobilde önerilmez.
- Liste tabloları dar ekranda temel alanları içeren kartlara dönüşür; kişisel veri gereksiz listelenmez.
- Kritik silme/yayından kaldırma işlemi açık ad, etki ve onay ister; yalnız renkli ikon kullanılmaz.

## 11. Nihai doğrulama

- [ ] Logo, marka rengi, fotoğraf ve font lisansı teslim edildi.
- [ ] Geçici renk token’ları klinik sahibi tarafından onaylandı veya değiştirildi.
- [ ] Tüm gerçek metin/zemin/bileşen kombinasyonları contrast aracıyla WCAG AA doğrulandı.
- [ ] 320, 375, 768, 1024 ve 1440 px ekran tasarımları gerçek içerikle kontrol edildi.
- [ ] Klavye, zoom/reflow ve reduced-motion davranışı prototip/uygulamada doğrulandı.
