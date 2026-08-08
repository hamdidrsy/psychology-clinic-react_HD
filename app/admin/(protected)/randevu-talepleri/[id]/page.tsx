import { notFound } from "next/navigation";

import { AdminAppointmentStatusForm } from "@/components/admin-appointment-status-form";
import { appointmentStatusLabels } from "@/lib/admin/appointment-schema";
import { formatDateTime } from "@/lib/format-date";
import { requireAdmin } from "@/server/auth/session";
import { getDb } from "@/server/db";

export default async function AppointmentRequestDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireAdmin("ADMIN");
  const request = await getDb().appointmentRequest.findUnique({
    where: { id: (await params).id },
    include: {
      service: { select: { name: true } },
      statusHistory: {
        orderBy: { createdAt: "desc" },
        include: { changedByAdmin: { select: { displayName: true } } },
      },
    },
  });
  if (!request) notFound();
  const saved = (await searchParams).saved;
  const details = [
    ["Referans", request.referenceCode],
    ["Ad soyad", request.fullName],
    ["E-posta", request.email ?? "—"],
    ["Telefon", request.phone ?? "—"],
    [
      "Tercih edilen kanal",
      request.preferredContactMethod === "EMAIL" ? "E-posta" : "Telefon",
    ],
    ["Uygun zaman", request.preferredContactTime ?? "—"],
    ["Hizmet", request.service?.name ?? "Belirtilmedi"],
    ["Oluşturulma", formatDateTime(request.createdAt)],
    ["Saklama bitişi", formatDateTime(request.retentionExpiresAt)],
  ];
  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.4fr_1fr]">
      <section>
        <p className="eyebrow">{request.referenceCode}</p>
        <h1 className="text-3xl font-bold">Randevu talebi</h1>
        {saved && (
          <p
            className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 text-green-800"
            role="status"
          >
            Durum başarıyla güncellendi.
          </p>
        )}
        <dl className="border-border bg-border mt-7 grid gap-px overflow-hidden rounded-2xl border sm:grid-cols-2">
          {details.map(([label, value]) => (
            <div className="bg-white p-4" key={label}>
              <dt className="text-ink-muted text-xs font-bold uppercase">
                {label}
              </dt>
              <dd className="mt-1 break-words">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="border-border mt-6 rounded-2xl border bg-white p-5">
          <h2 className="font-bold">Kullanıcının notu</h2>
          <p className="text-ink-muted mt-3 whitespace-pre-wrap">
            {request.note ?? "Not bırakılmadı."}
          </p>
        </div>
        <div className="mt-6">
          <h2 className="text-xl font-bold">Durum geçmişi</h2>
          <ol className="mt-4 space-y-3">
            {request.statusHistory.map((item) => (
              <li
                className="border-border rounded-xl border bg-white p-4"
                key={item.id}
              >
                <strong>{appointmentStatusLabels[item.toStatus]}</strong>
                <p className="text-ink-muted text-sm">
                  {formatDateTime(item.createdAt)} ·{" "}
                  {item.changedByAdmin?.displayName ?? "Sistem"}
                </p>
                {item.operationalNote && (
                  <p className="mt-2 text-sm">{item.operationalNote}</p>
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>
      <aside className="border-border h-fit rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">Durumu güncelle</h2>
        <p className="text-ink-muted mt-2 mb-5 text-sm">
          Mevcut durum: {appointmentStatusLabels[request.status]}
        </p>
        <AdminAppointmentStatusForm
          appointmentId={request.id}
          currentStatus={request.status}
        />
      </aside>
    </main>
  );
}
