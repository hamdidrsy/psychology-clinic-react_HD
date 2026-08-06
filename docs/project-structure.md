# Proje Yapısı ve Modül Sınırları

```text
app/          Next.js App Router sayfaları, layout ve route handler'lar
components/   Paylaşılan UI ve kompozisyon bileşenleri
lib/          Ortamdan bağımsız yardımcılar, sabitler ve paylaşılan şemalar
server/       Yalnız sunucuda çalışan servis, repository, auth ve ortam kodu
prisma/       Prisma şeması, migration ve güvenli seed
emails/       E-posta şablonları ve e-posta tipleri
public/       Onaylı statik varlıklar
tests/        Test kurulumu ve çapraz modül testleri
docs/         Ürün, mimari, güvenlik ve operasyon kayıtları
```

## Sınır kuralları

- `app` içindeki route/page dosyaları ince tutulur; iş kuralları `server` veya `lib` modüllerine gider.
- Veritabanı ve secret kullanan modüller `server-only` ile işaretlenir ve `server` altında tutulur.
- Client component’ler `server` modülünü doğrudan veya dolaylı import edemez.
- `NEXT_PUBLIC_` öneki yalnız gerçekten tarayıcıya açıklanabilecek değerler içindir.
- Zod şemaları kişisel veri sınırında hem istemci deneyimi hem sunucu güven sınırı için paylaşılabilir; sunucu doğrulaması zorunludur.
- Domain modülleri büyüdükçe `server/articles`, `server/appointments`, `server/auth` gibi ayrılır.
- `@/*` alias’ı yalnız proje kökünü gösterir; modülün public API’si mümkünse barrel yerine açık dosya import’u kullanır.
- React Server Component varsayılandır; `"use client"` mümkün olan en küçük etkileşimli yaprağa konur.
