# Bağımlılık ve Güvenlik Güncelleme Politikası

- Production bağımlılıkları doğrudan ve açık amaçla eklenir; aynı işi yapan gereksiz paket eklenmez.
- `package-lock.json` repoya alınır ve CI’da `npm ci` kullanılır.
- Yeni paket eklenmeden önce bakım durumu, lisans, yayıncı/geçmiş, bağımlılık ağacı, bundle ve server/client etkisi incelenir.
- Next.js, React, auth, Prisma, Zod ve e-posta sağlayıcısının güvenlik duyuruları takip edilir.
- Otomatik dependency PR aracı haftalık çalışacak biçimde yapılandırılır; major sürümler manuel migration ve staging testi gerektirir.
- Kritik güvenlik güncellemesi derhal, yüksek bulgu 7 gün içinde değerlendirilir. Orta/düşük bulgular aylık bakımda ele alınır.
- `npm audit --omit=dev --audit-level=high` CI’da çalışır; false positive/ertelenen bulgu gerekçe, sahip ve hedef tarihle risk kaydına girer.
- Bağımlılık güncellemesi lint, typecheck, test ve production build geçmeden birleştirilmez.
- Lockfile dışında elle `node_modules` değişikliği yapılmaz. Yaşam döngüsü script’leri ve transitive değişiklikler lockfile diff’inde incelenir.
