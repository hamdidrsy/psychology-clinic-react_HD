# Yönetici kimlik doğrulama ve yetkilendirme

## Karar

İlk sürümde harici kimlik sağlayıcı yerine PostgreSQL destekli opak oturum kullanılır. Parolalar Argon2id ile (`m=19456 KiB`, `t=2`, `p=1`) özetlenir. Tarayıcıdaki 256 bit rastgele oturum belirtecinin yalnız SHA-256 özeti veritabanında tutulur. Bu yaklaşım Auth.js yerine seçilmiştir; tek yönetici ve modüler monolit yapısında hesap/oturum yaşam döngüsünü açıkça denetlemeyi sağlar.

## Güvenlik sınırları

- Production çerezi `__Host-admin_session`; `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/` ve yüksek önceliklidir.
- Oturum varsayılan 8 saatlik mutlak ömre sahiptir. Her başarılı girişte yeni belirteç üretilir. Parola değişiminde, hesap pasifleştirildiğinde veya CLI iptalinde oturum kullanılamaz.
- `proxy.ts` yalnız hızlı çerez ön kontrolüdür. Asıl güven sınırı protected layout, her server-side sorgu ve mutation içindeki `requireAdmin()` / rol kontrolüdür.
- Geri dönüş URL’si yalnız `/admin` altındaki yerel yollara izin verir; protocol-relative ve dış yönlendirmeler reddedilir.
- Girişte e-posta başına 5/15 dakika, güvenilir istemci adresi başına 20/15 dakika merkezi PostgreSQL limiti ve en az 650 ms yanıt süresi uygulanır.
- Olmayan, pasif veya yanlış parolalı hesaplar aynı mesajı alır. Bilinmeyen hesaplarda da gerçek Argon2id doğrulaması çalıştırılır.
- Denetim loglarında parola, oturum belirteci, e-posta veya IP tutulmaz.

## İlk yönetici

Parolayı komut satırı argümanına yazmayın. Geçici ortam değişkenleriyle çalıştırın:

```powershell
$env:ADMIN_EMAIL="admin@example.com"
$env:ADMIN_DISPLAY_NAME="Klinik Yöneticisi"
$env:ADMIN_PASSWORD="uzun-ve-benzersiz-parola"
npm run admin:create
Remove-Item Env:ADMIN_EMAIL, Env:ADMIN_DISPLAY_NAME, Env:ADMIN_PASSWORD
```

Production’da ayrıca `CONFIRM_PRODUCTION_ADMIN_CREATE=yes` gerekir. Komut mevcut hesabın üzerine yazmaz. Development seed hiçbir yönetici hesabı oluşturmaz.

## Kurtarma ve olay müdahalesi

Parola sıfırlama e-postası ilk sürümde yoktur. Sunucu/veritabanı erişimi olan yetkili operatör `ADMIN_EMAIL` ve yeni `ADMIN_PASSWORD` ile `npm run admin:reset-password` çalıştırır. Bu işlem tüm aktif oturumları iptal eder ve denetim kaydı oluşturur. Yalnız oturum iptali için `npm run admin:revoke-sessions` kullanılır.

Kurtarma öncesinde talep sahibinin kimliği proje sahibi tarafından ikinci bir kanaldan doğrulanmalı; işlem zamanı ve yapan kişi olay kaydına yazılmalıdır. Parola veya secret destek mesajında paylaşılmamalıdır.

## MFA değerlendirmesi

Randevu iletişim verilerine erişim nedeniyle MFA production için güçlü biçimde önerilir. İlk sürümde güvenli enrollment, kurtarma kodu ve cihaz kaybı prosedürü olmadan eksik bir TOTP özelliği yayınlanmaz. Production açılışından önce yönetilen bir kimlik sağlayıcı/passkey veya tam TOTP+kurtarma akışı seçilmeli ve test edilmelidir. Bu madde tamamlanana kadar faz çıkış kriteri açık kalır.

## Yetkilendirme politikası

- `ADMIN`: hesap/yetki yönetimi dahil tüm yönetim işlemleri.
- `EDITOR`: gelecekte yalnız makale yönetimi; randevu verisine varsayılan erişimi yoktur.
- Her yeni admin sayfası protected route group altında olmalı; veri sorgusu ve her değiştirici işlem kendi sunucu tarafı rol kontrolünü tekrar etmelidir.

## Production kontrolü

- Uzun ve benzersiz `AUTH_SECRET`, HTTPS ve gerçek PostgreSQL zorunludur.
- Varsayılan/demo hesap bulunmadığı gerçek production veritabanında sorgulanarak doğrulanır.
- Yetkisiz erişim, brute force, pasif hesap, parola sonrası oturum iptali ve cookie nitelikleri staging’de entegrasyon testiyle kanıtlanır.
- Süresi dolmuş/iptal edilmiş oturumlar periyodik bakım işiyle silinir.
