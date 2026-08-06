# ADR-0001: Next.js App Router tabanlı modüler monolit

- Durum: Kabul edildi
- Tarih: 2026-08-06
- Karar verenler: Proje başlangıç teknik kapsamı; kişi ataması bekleniyor
- İlgili kayıtlar: `proje_adımları.md`

## Bağlam

Proje; herkese açık içerik sayfaları, randevu talebi, yönetici kimlik doğrulaması, makale/randevu yönetimi, PostgreSQL ve e-posta bildirimi içeriyor. İlk sürüm için ayrı frontend, backend ve CMS servisleri operasyon maliyetini artırırken doğrulanmış bir ölçek ihtiyacı bulunmuyor.

## Değerlendirilen seçenekler

1. Next.js App Router içinde modüler monolit ve server-side işlemler.
2. Ayrı Next.js frontend ve ayrı API backend.
3. Headless CMS ağırlıklı mimari.

## Karar

Next.js App Router ve TypeScript kullanan modüler monolit seçildi. Herkese açık sayfalar, admin arayüzü ve sunucu işlemleri tek deployable uygulamada; domain sınırları modül/dizin düzeyinde ayrılacak. PostgreSQL'e Prisma ile erişilecek, e-posta Resend adapter'ı arkasında tutulacak.

Sunucuya özel kod istemci bundle'ına taşınmayacak. Yetkilendirme yalnız route/middleware düzeyinde değil, veri ve mutation sınırında da uygulanacak.

## Sonuçlar

### Olumlu

- Tek depo ve tek yayın hattı ilk sürümün geliştirme/operasyon yükünü azaltır.
- React sunucu bileşenleri ve Next.js metadata/SEO yetenekleri doğrudan kullanılabilir.
- Ortak TypeScript/Zod tipleri form ve sunucu doğrulamasında paylaşılabilir.
- Gereksiz ağ sınırları ve dağıtık işlem karmaşıklığı oluşmaz.

### Olumsuz / risk

- Domain sınırları disiplinle korunmazsa sıkı bağlı bir kod tabanı oluşabilir.
- Uzun süren e-posta/iş görevleri ileride kuyruk veya worker gerektirebilir.
- Hosting seçimi bazı Next.js çalışma zamanı özelliklerine bağımlılık yaratabilir.

## Doğrulama ve geri alma

Build süresi, uygulama boyutu, randevu işleme güvenilirliği ve operasyon yükü izlenecek. Bağımsız ölçekleme veya hata izolasyonu ihtiyacı kanıtlanırsa e-posta işi ya da API domain'i, mevcut servis/adapter sınırları üzerinden ayrı servise çıkarılabilir.
