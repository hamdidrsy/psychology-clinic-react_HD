import Link from "next/link";

import type { Prisma } from "@/generated/prisma/client";
import {
  appointmentStatuses,
  appointmentStatusLabels,
} from "@/lib/admin/appointment-schema";
import { formatDateTime } from "@/lib/format-date";
import { requireAdmin } from "@/server/auth/session";
import { getDb } from "@/server/db";

const pageSize = 20;
export default async function AppointmentRequestsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin("ADMIN");
  const params = await searchParams;
  const status =
    typeof params.status === "string" &&
    appointmentStatuses.includes(
      params.status as (typeof appointmentStatuses)[number],
    )
      ? (params.status as (typeof appointmentStatuses)[number])
      : undefined;
  const needsAction = params.needsAction === "1";
  const page = Math.max(
    1,
    Number.parseInt(typeof params.page === "string" ? params.page : "1", 10) ||
      1,
  );
  const from =
    typeof params.from === "string" && /^\d{4}-\d{2}-\d{2}$/.test(params.from)
      ? new Date(`${params.from}T00:00:00+03:00`)
      : undefined;
  const to =
    typeof params.to === "string" && /^\d{4}-\d{2}-\d{2}$/.test(params.to)
      ? new Date(`${params.to}T23:59:59+03:00`)
      : undefined;
  const where: Prisma.AppointmentRequestWhereInput = {
    ...(status
      ? { status }
      : needsAction
        ? { status: { in: ["NEW", "CONTACTED"] } }
        : {}),
    ...(from || to
      ? {
          createdAt: {
            ...(from ? { gte: from } : {}),
            ...(to ? { lte: to } : {}),
          },
        }
      : {}),
  };
  const db = getDb();
  const [requests, count] = await Promise.all([
    db.appointmentRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        referenceCode: true,
        fullName: true,
        preferredContactMethod: true,
        status: true,
        createdAt: true,
      },
    }),
    db.appointmentRequest.count({ where }),
  ]);
  const pages = Math.max(1, Math.ceil(count / pageSize));
  const queryBase = new URLSearchParams();
  if (status) queryBase.set("status", status);
  if (needsAction) queryBase.set("needsAction", "1");
  if (params.from && typeof params.from === "string")
    queryBase.set("from", params.from);
  if (params.to && typeof params.to === "string")
    queryBase.set("to", params.to);
  const pageHref = (nextPage: number) => {
    const query = new URLSearchParams(queryBase);
    query.set("page", String(nextPage));
    return `?${query}`;
  };
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <p className="eyebrow">İş kuyruğu</p>
      <h1 className="text-3xl font-bold">Randevu talepleri</h1>
      <form className="border-border mt-7 grid gap-3 rounded-2xl border bg-white p-4 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <label className="form-label" htmlFor="status-filter">
            Durum
          </label>
          <select
            className="form-control"
            defaultValue={status ?? ""}
            id="status-filter"
            name="status"
          >
            <option value="">Tümü</option>
            {appointmentStatuses.map((item) => (
              <option key={item} value={item}>
                {appointmentStatusLabels[item]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="form-label" htmlFor="from">
            Başlangıç
          </label>
          <input
            className="form-control"
            defaultValue={typeof params.from === "string" ? params.from : ""}
            id="from"
            name="from"
            type="date"
          />
        </div>
        <div>
          <label className="form-label" htmlFor="to">
            Bitiş
          </label>
          <input
            className="form-control"
            defaultValue={typeof params.to === "string" ? params.to : ""}
            id="to"
            name="to"
            type="date"
          />
        </div>
        <label className="choice-control mt-6">
          <input
            defaultChecked={needsAction}
            name="needsAction"
            type="checkbox"
            value="1"
          />
          İşlem gereken
        </label>
        <button className="button-secondary mt-6" type="submit">
          Filtrele
        </button>
      </form>
      <div className="border-border mt-6 overflow-x-auto rounded-2xl border bg-white">
        {requests.length === 0 ? (
          <p className="text-ink-muted p-8">
            Bu filtrede randevu talebi bulunmuyor.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-muted">
              <tr>
                <th className="p-4">Referans</th>
                <th className="p-4">Ad</th>
                <th className="p-4">Durum</th>
                <th className="p-4">Kanal</th>
                <th className="p-4">Tarih</th>
                <th className="p-4">
                  <span className="sr-only">İşlem</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr className="border-border border-t" key={request.id}>
                  <td className="p-4 font-mono text-xs">
                    {request.referenceCode}
                  </td>
                  <td className="p-4 font-bold">{request.fullName}</td>
                  <td className="p-4">
                    {appointmentStatusLabels[request.status]}
                  </td>
                  <td className="p-4">
                    {request.preferredContactMethod === "EMAIL"
                      ? "E-posta"
                      : "Telefon"}
                  </td>
                  <td className="p-4">{formatDateTime(request.createdAt)}</td>
                  <td className="p-4">
                    <Link
                      className="text-link underline"
                      href={`/admin/randevu-talepleri/${request.id}`}
                    >
                      İncele
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <nav
        className="mt-5 flex items-center justify-between"
        aria-label="Sayfalama"
      >
        <span className="text-ink-muted text-sm">
          Sayfa {page} / {pages}
        </span>
        <div className="flex gap-2">
          {page > 1 && (
            <Link className="button-secondary" href={pageHref(page - 1)}>
              Önceki
            </Link>
          )}
          {page < pages && (
            <Link className="button-secondary" href={pageHref(page + 1)}>
              Sonraki
            </Link>
          )}
        </div>
      </nav>
    </main>
  );
}
