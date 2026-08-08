import "server-only";

import { getDb } from "@/server/db";

export async function getPublishedArticleBySlug(slug: string) {
  return getDb().article.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      author: { select: { displayName: true } },
      category: { select: { name: true } },
    },
  });
}

export async function getPublishedArticles(limit = 100) {
  return getDb().article.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
    take: limit,
    include: {
      author: { select: { displayName: true } },
      category: { select: { name: true } },
    },
  });
}

export async function getPublishedRedirect(oldSlug: string) {
  return getDb().articleSlugRedirect.findFirst({
    where: { oldSlug, article: { status: "PUBLISHED" } },
    select: { article: { select: { slug: true } } },
  });
}
