import Link from "next/link";

import { articleStatuses } from "@/lib/admin/article-schema";
import { formatDate } from "@/lib/format-date";
import { requireContentManager } from "@/server/auth/session";
import { getDb } from "@/server/db";

const pageSize = 15;

export default async function AdminArticlesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireContentManager();
  const params = await searchParams;
  const status =
    typeof params.status === "string" &&
    articleStatuses.includes(params.status as (typeof articleStatuses)[number])
      ? (params.status as (typeof articleStatuses)[number])
      : undefined;
  const page = Math.max(
    1,
    Number.parseInt(typeof params.page === "string" ? params.page : "1", 10) ||
      1,
  );
  const where = status ? { status } : {};
  const db = getDb();
  const [articles, count] = await Promise.all([
    db.article.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { author: { select: { displayName: true } } },
    }),
    db.article.count({ where }),
  ]);
  const pages = Math.max(1, Math.ceil(count / pageSize));
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">İçerik</p>
          <h1 className="text-3xl font-bold">Makaleler</h1>
        </div>
        <Link className="button-primary" href="/admin/makaleler/yeni">
          Yeni makale
        </Link>
      </div>
      <form className="mt-7 flex flex-wrap items-end gap-3">
        <div>
          <label className="form-label" htmlFor="status-filter">
            Durum
          </label>
          <select
            className="form-control min-w-48"
            defaultValue={status ?? ""}
            id="status-filter"
            name="status"
          >
            <option value="">Tümü</option>
            <option value="DRAFT">Taslak</option>
            <option value="PUBLISHED">Yayında</option>
            <option value="ARCHIVED">Arşiv</option>
          </select>
        </div>
        <button className="button-secondary" type="submit">
          Filtrele
        </button>
      </form>
      <div className="border-border mt-6 overflow-x-auto rounded-2xl border bg-white">
        {articles.length === 0 ? (
          <p className="text-ink-muted p-8">Bu filtrede makale bulunmuyor.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-muted">
              <tr>
                <th className="p-4">Başlık</th>
                <th className="p-4">Durum</th>
                <th className="p-4">Yazar</th>
                <th className="p-4">Güncellendi</th>
                <th className="p-4">
                  <span className="sr-only">İşlem</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr className="border-border border-t" key={article.id}>
                  <td className="p-4 font-bold">{article.title}</td>
                  <td className="p-4">{article.status}</td>
                  <td className="p-4">{article.author.displayName}</td>
                  <td className="p-4">{formatDate(article.updatedAt)}</td>
                  <td className="p-4">
                    <Link
                      className="text-link underline"
                      href={`/admin/makaleler/${article.id}`}
                    >
                      Düzenle
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
            <Link
              className="button-secondary"
              href={`?${status ? `status=${status}&` : ""}page=${page - 1}`}
            >
              Önceki
            </Link>
          )}
          {page < pages && (
            <Link
              className="button-secondary"
              href={`?${status ? `status=${status}&` : ""}page=${page + 1}`}
            >
              Sonraki
            </Link>
          )}
        </div>
      </nav>
    </main>
  );
}
