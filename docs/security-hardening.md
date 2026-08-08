# Güvenlik sertleştirme kaydı

Son güncelleme: 9 Ağustos 2026

## Tehdit modeli

Korunan varlıklar randevu sahiplerinin kişisel/sağlıkla ilişkili beyanları, yönetici kimlik bilgileri ve oturumları, yayımlanan içerik, audit kayıtları, veritabanı ve e-posta anahtarlarıdır. Aktörler anonim ziyaretçi, bot, kötü niyetli kullanıcı, ele geçirilmiş editör hesabı, yönetici ve altyapı sağlayıcısıdır.

Giriş noktaları iletişim formu, admin giriş formu, admin Server Action'ları, makale Markdown ve URL alanları, oturum çerezi, ortam değişkenleri ve CI/deploy hattıdır. Başlıca senaryolar ve kontroller:

| Senaryo            | Kontrol                                                                                   | Kalan risk                                                       |
| ------------------ | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Form spam/DoS      | PostgreSQL merkezli kimlik ve adres rate limit, Zod, bot alanı                            | Dağıtık düşük hızlı saldırı; WAF production kararı               |
| Hesap ele geçirme  | Argon2id, opaque oturum, secure/httpOnly cookie, hız sınırı, audit                        | Uygulama MFA'sı henüz yok                                        |
| IDOR/BOLA          | Her sayfa ve mutation'da server-side rol kontrolü; randevu yalnız `ADMIN`                 | Yetkili admin içeriden erişebilir; audit ve en az yetki gerekir  |
| XSS/Markdown       | React encoding, ham HTML/H1/tehlikeli link reddi, JSON-LD escaping, nonce CSP             | Yeni renderer/üçüncü taraf script eklenirse yeniden inceleme     |
| SSRF/açık redirect | Dış URL'ler yalnız public HTTPS; sunucu URL fetch etmiyor; admin redirect yalnız `/admin` | DNS rebinding ancak ileride fetch eklenirse ayrıca çözülmeli     |
| Secret sızıntısı   | server-only env şeması, maskeli hata kayıtları, CI secret taraması                        | Git geçmişi ve provider log taraması production öncesi yapılmalı |
| Clickjacking/MIME  | `frame-ancestors 'none'`, DENY, nosniff                                                   | Yok sayılabilir                                                  |

## ASVS 5.0 / OWASP Top 10 kontrol özeti

Bu kayıt bağımsız ASVS sertifikasyonu değildir. Kimlik doğrulama ve oturum kontrolleri `docs/admin-authentication.md`, kişisel veri kontrolleri `docs/privacy-data-lifecycle.md` içindedir. Server Action'lar Zod ile doğrulanır ve işlem içinde tekrar yetkilendirilir. Prisma'nın tipli sorguları kullanılır; rate-limit upsert'i tek raw SQL noktasıdır ve Prisma tagged-template parametrelemesi kullanır. CORS açılmamıştır; uygulama aynı-origin Server Action kullanır.

Markdown HTML'e çevrilmeden React elemanları olarak render edilir; ham HTML ve `javascript:`/`data:` linkleri şemada reddedilir. Dosya yükleme özelliği yoktur. Eklenirse magic byte, allowlist MIME/uzantı, rastgele ad, boyut limiti, ayrı depolama origin'i ve erişim politikası zorunludur.

## HTTP ve hata güvenliği

Proxy her istekte nonce üretir. Production CSP script/style için nonce kullanır; `unsafe-inline` ve `unsafe-eval` yoktur. Development hot reload için bu istisnalar yalnız yerel ortamda vardır. HSTS yalnız production'da gönderilir. Tarayıcı production source map'i kapalıdır. Kullanıcı hata yanıtları geneldir; loglara form gövdesi, parola, token, sorgu veya hata mesajı yazılmaz.

## Rate limit davranışı

Sayaç PostgreSQL'de atomik ve tüm uygulama örnekleri için ortaktır. Veritabanı erişilemezse randevu ve giriş işlemi tamamlanmaz (fail-closed). Bu, gizlilik ve brute-force güvenliğini erişilebilirliğe tercih eder. `TRUST_PROXY_HEADERS` yalnız doğrulanmış production proxy zincirinde açılmalıdır.

## Secret rotasyonu / olay adımları

1. Etkilenen anahtarı sağlayıcıda derhal iptal et; yeni anahtarı farklı ve güçlü üret.
2. Vercel/hosting ortamına yeni değeri koyup yeniden deploy et. Eski değeri local `.env.local` dosyalarından kaldır.
3. `AUTH_SECRET` sızdıysa tüm admin oturumlarını iptal et; DB parolası sızdıysa kullanıcı parolasını döndür ve bağlantıları sonlandır.
4. Git geçmişi, CI çıktıları ve provider loglarını kapsam için tara; secret'ı yalnız dosyadan silmeyi yeterli sayma.
5. Audit zaman çizelgesini, etkilenen veriyi ve KVKK ihlal prosedürü kararını kaydet.

## Production kapıları

- Hosting ve DB hesaplarında MFA etkinleştirilecek.
- Uygulama admin MFA'sı tasarlanıp uygulanacak.
- Production DB için ayrı migration ve runtime rolleri kullanılacak; runtime rolüne yalnız gerekli tablo/sequence izinleri verilecek ve `sslmode=require`/sağlayıcının doğrulamalı TLS ayarı zorlanacak.
- Git geçmişi/provider secret scan'i, log redaction ve HSTS gerçek HTTPS origin'de doğrulanacak.
- Next.js, React, Prisma, Argon2 ve Resend güvenlik duyurularının sahibi atanacak; Dependabot haftalık PR'ları ve CI `npm audit` sonuçları incelenecek.
- Bağımsız güvenlik incelemesi/sızma testi yapılacak; kritik/yüksek bulgular kapatılmadan çıkış kriteri tamamlanmış sayılmayacak.
