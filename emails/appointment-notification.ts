export type AppointmentNotificationTemplateInput = {
  referenceCode: string;
  fullName: string;
  preferredContactMethod: "EMAIL" | "PHONE";
  email?: string;
  phone?: string;
  serviceName?: string;
  createdAt: Date;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => {
    const replacements: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;",
    };
    return replacements[character] ?? character;
  });
}

const dateFormatter = new Intl.DateTimeFormat("tr-TR", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Europe/Istanbul",
});

export function appointmentNotificationTemplate(
  input: AppointmentNotificationTemplateInput,
) {
  const contactMethod =
    input.preferredContactMethod === "EMAIL" ? "E-posta" : "Telefon";
  const contactValue =
    input.preferredContactMethod === "EMAIL" ? input.email : input.phone;
  const safeRows = [
    ["Talep referansı", input.referenceCode],
    ["Alınma zamanı", dateFormatter.format(input.createdAt)],
    ["Ad soyad", input.fullName],
    ["Tercih edilen kanal", contactMethod],
    ["İletişim bilgisi", contactValue ?? "Sağlanmadı"],
    ["Hizmet", input.serviceName ?? "Belirtilmedi"],
  ] as const;

  const subject = `Yeni randevu talebi — ${input.referenceCode}`;
  const text = [
    "Yeni bir randevu talebi kaydedildi.",
    "",
    ...safeRows.map(([label, value]) => `${label}: ${value}`),
    "",
    "Bu bildirim serbest not veya sağlık bilgisi içermez. Talep kesin randevu değildir.",
  ].join("\n");

  const htmlRows = safeRows
    .map(
      ([label, value]) =>
        `<tr><th align="left" style="padding:8px 12px;color:#46566d;font-size:14px">${escapeHtml(label)}</th><td style="padding:8px 12px;color:#152238;font-size:14px">${escapeHtml(String(value))}</td></tr>`,
    )
    .join("");

  const html = `<!doctype html><html lang="tr"><body style="margin:0;background:#f7f9fc;font-family:Arial,sans-serif;color:#152238"><div style="max-width:640px;margin:0 auto;padding:32px 16px"><div style="background:#ffffff;border:1px solid #b7c2d0;border-radius:16px;overflow:hidden"><div style="background:#1d3557;padding:24px;color:#ffffff"><h1 style="margin:0;font-size:22px">Yeni randevu talebi</h1></div><div style="padding:20px"><p style="line-height:1.6">Yeni bir randevu talebi güvenli biçimde kaydedildi.</p><table role="presentation" style="width:100%;border-collapse:collapse">${htmlRows}</table><p style="margin-top:20px;color:#46566d;font-size:13px;line-height:1.6">Bu bildirim serbest not veya sağlık bilgisi içermez. Talep kesin randevu değildir.</p></div></div></div></body></html>`;

  return { subject, text, html };
}
