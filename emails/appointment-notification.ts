export type AppointmentNotificationTemplateInput = { createdAt: Date };

const dateFormatter = new Intl.DateTimeFormat("tr-TR", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Europe/Istanbul",
});

export function appointmentNotificationTemplate(
  input: AppointmentNotificationTemplateInput,
) {
  const receivedAt = dateFormatter.format(input.createdAt);
  const subject = "Yeni anonim randevu talebi";
  const text = [
    "Yeni bir anonim randevu talebi kaydedildi.",
    `Alınma zamanı: ${receivedAt}`,
    "Talebi yalnız güvenli yönetim panelinden inceleyin.",
    "Bu e-posta kimlik bilgisi, iletişim bilgisi, takip sırrı veya şifreli paket içermez.",
  ].join("\n");
  const html = `<!doctype html><html lang="tr"><body style="margin:0;background:#f7f9fc;font-family:Arial,sans-serif;color:#152238"><div style="max-width:640px;margin:0 auto;padding:32px 16px"><div style="background:#fff;border:1px solid #b7c2d0;border-radius:16px;padding:24px"><h1 style="margin:0 0 16px;font-size:22px">Yeni anonim randevu talebi</h1><p>Alınma zamanı: ${receivedAt}</p><p>Talebi yalnız güvenli yönetim panelinden inceleyin.</p><p style="color:#46566d;font-size:13px">Bu e-posta kimlik bilgisi, iletişim bilgisi, takip sırrı veya şifreli paket içermez.</p></div></div></body></html>`;
  return { subject, text, html };
}
