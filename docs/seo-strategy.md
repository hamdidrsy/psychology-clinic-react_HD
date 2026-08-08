# SEO ve keşfedilebilirlik stratejisi

## Arama niyeti ve etik sınırlar

İlk sürüm hacim tahmini olmayan nitel bir niyet haritası kullanır. Production şehir/hizmet bölgesi, doğrulanmış unvan ve hizmet kapsamı gelmeden yerel veya klinik iddialı anahtar kelimeler hedeflenmez.

| Niyet                   | Hedef sayfa    | Örnek konu kümesi                 | Sınır                                 |
| ----------------------- | -------------- | --------------------------------- | ------------------------------------- |
| Uzmanı/çerçeveyi tanıma | `/hakkimda`    | yaklaşım, görüşme çerçevesi       | Doğrulanmamış unvan/sertifika yok     |
| Hizmeti anlama          | `/hizmetler/*` | bireysel, çevrim içi, ilk görüşme | Tanı, garanti ve üstünlük iddiası yok |
| Süreci araştırma        | `/makaleler/*` | ilk görüşme, hazırlık, gizlilik   | Kişiye özel tıbbi öneri yok           |
| İletişim                | `/iletisim`    | randevu talebi, iletişim          | Talebin kesin randevu olmadığı açık   |

Gerçek sorgu/veri çalışması Search Console verisi, doğrulanmış hizmet bölgesi ve klinik onayından sonra yapılır. Sağlık içeriği kaynak, yazar ve güncellenme tarihi olmadan production’da yayınlanmaz.

## URL ve index politikası

- Canonical origin tek kaynaktır: `NEXT_PUBLIC_SITE_URL`; sonunda slash bulunmaz.
- URL’ler ASCII, küçük harf ve tire kullanır. `trailingSlash=false` ile tek biçim korunur.
- Admin, giriş, önizleme ve filtre/sonuç URL’leri sitemap’e girmez; admin layout ayrıca `noindex` üretir.
- Sitemap yalnız public canonical rotaları ve yayınlanmış makaleleri içerir.
- Makale slug değişikliği `ArticleSlugRedirect` kaydıyla 308 kalıcı yönlendirmeye dönüşür.
- Bilinmeyen hizmet/makale slug’ı 404 arayüzü ve `noindex` üretir. Dinamik makalelerde Next.js streaming yanıtının HTTP 200 başlatması nedeniyle gerçek durum kodu için ek çözüm gerekir; bu yayın öncesi açık kontroldür.

## Metadata haritası

Her public sayfada benzersiz `title`, `description`, tek görünür H1, self-canonical, Open Graph ve X/Twitter metadata bulunur. Dinamik hizmet ve makale sayfaları kendi başlık/özetini kullanır. Admin kaynaklı makalelerde onaylı SEO alanları varsa bunlar tercih edilir.

## Yapılandırılmış veri kararı

- `WebSite`: yalnız görünür site adı ve canonical origin.
- `BreadcrumbList`: görünür breadcrumb bulunan hizmet/makale detayları.
- `Article`: görünür başlık, özet, yazar, yayın/güncellenme tarihi ve varsa crawl edilebilir görsel.
- `Person`, `Organization` veya sağlık/yerel işletme alt türü: unvan, adres ve mesleki bilgiler doğrulanana kadar eklenmez.
- `FAQPage`: Google düzenli FAQ zengin sonucunu tanınmış otoriter sağlık/kamu siteleriyle sınırladığı ve klinik otoritesi henüz doğrulanmadığı için eklenmez.

JSON-LD `<`, U+2028 ve U+2029 karakterlerini kaçıran ortak serializer ile üretilir; yalnız kullanıcıya görünür veri işaretlenir.

## Görseller

Kodla üretilen 1200×630 varsayılan OG görseli ve SVG favicon bulunur. Makale görseli yalnız doğrulanmış URL ve alt metinle kullanılabilir. Production görselleri anlamlı dosya adı, doğru boyut/format ve crawl edilebilir URL ile sağlanmalıdır.

## Production sonrası

1. Canonical production origin doğrulanır.
2. Rich Results Test ile Article/Breadcrumb örnekleri test edilir.
3. Search Console domain doğrulaması yapılır; `/sitemap.xml` gönderilir.
4. URL Inspection ile canonical, index ve render kontrol edilir.
5. Core Web Vitals ve sorgu performansı aylık izlenir; içerik boşlukları etik/onaylı kapsamda ele alınır.

## Resmî dayanaklar

- Next.js Metadata API, metadata dosyaları ve sitemap sözleşmesi.
- Google Search Central canonical, robots, sitemap, Article, Breadcrumb ve genel yapılandırılmış veri yönergeleri.
