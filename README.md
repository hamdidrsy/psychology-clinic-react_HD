# Psychology Clinic Hasan Durusoy

Hasan Durusoy için Next.js, TypeScript, Tailwind CSS, PostgreSQL, Prisma ORM ve Resend tabanlı psikoloji kliniği web sitesi.

## Durum

Teknik proje temeli kurulmuştur. Sayfalar, veri modeli, randevu akışı ve admin özellikleri ilgili plan fazlarında geliştirilecektir. Güncel takip için `proje_adımları.md` dosyasına bakın.

## Gereksinimler

- Node.js `22.20.0` (LTS; `.nvmrc` ve `.node-version` ile sabitlenmiştir)
- npm `10.9.x` veya uyumlu `>=10.9 <12`
- Veri özellikleri geliştirildiğinde PostgreSQL

Node 24 LTS’e geçiş, tüm bağımlılık ve CI kontrolleriyle ayrı bir bakım değişikliği olarak yapılabilir.

## Yerel kurulum

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Windows PowerShell yürütme politikası `npm.ps1` dosyasını engelliyorsa komutlarda `npm.cmd` kullanılabilir:

```powershell
npm.cmd ci
Copy-Item .env.example .env.local
npm.cmd run dev
```

Uygulama varsayılan olarak `http://localhost:3000` adresinde çalışır. Gerçek secret değerleri repoya eklenmez.

## Komutlar

| Komut                     | Amaç                                                     |
| ------------------------- | -------------------------------------------------------- |
| `npm run dev`             | Geliştirme sunucusu                                      |
| `npm run build` / `start` | Production build ve sunucu                               |
| `npm run lint`            | ESLint ve Next.js kuralları                              |
| `npm run typecheck`       | TypeScript strict kontrolü                               |
| `npm run test`            | Vitest testleri                                          |
| `npm run format:check`    | Prettier biçim kontrolü                                  |
| `npm run check`           | Format, lint, typecheck, test ve build                   |
| `npm run prisma:*`        | Prisma generate, validate, migration ve studio işlemleri |
| `npm run db:seed`         | Yalnız development/test için sahte hizmet seed’i         |
| `npm run audit`           | Production bağımlılık güvenlik taraması                  |

## Ortam değişkenleri

Kaynak ve örnekler `.env.example` içindedir.

- `NEXT_PUBLIC_SITE_URL`: Tarayıcıya açık canonical origin; secret değildir.
- `DATABASE_URL`: PostgreSQL bağlantısı; yalnız sunucu.
- `RESEND_API_KEY`: Resend secret anahtarı.
- `APPOINTMENT_NOTIFICATION_TO`: Klinik bildirim alıcısı.
- `EMAIL_FROM`: Doğrulanmış gönderen kimliği.
- `AUTH_SECRET`: En az 32 karakterlik auth secret.

Eksik özellik secret’ları temel statik build’i engellemez. Bir özellik aktif edildiğinde `requireServerEnv` ile kendi zorunlu değişkenlerini doğrulamak zorundadır.

Prisma 7 CLI, migration işlemlerinde varsa `DIRECT_DATABASE_URL`, yoksa `DATABASE_URL` kullanır. Runtime istemcisi `DATABASE_URL` üzerinden PostgreSQL driver adapter’a bağlanır. Gerçek veritabanında ilk kurulum sırası:

```bash
npm run prisma:migrate:deploy
npm run prisma:generate
npm run db:seed # yalnız development/test
```

## Dokümantasyon

- `docs/governance.md`: roller, Git akışı ve tamamlandı tanımı
- `docs/discovery-and-requirements.md`: ürün kapsamı ve gereksinimler
- `docs/information-architecture.md`: site haritası ve kullanıcı akışları
- `docs/design-system.md`: görsel/erişilebilirlik kuralları
- `docs/project-structure.md`: modül ve server/client sınırları
- `docs/dependency-policy.md`: güncelleme ve güvenlik politikası
- `docs/decisions`: mimari karar kayıtları
