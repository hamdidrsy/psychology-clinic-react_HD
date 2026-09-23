import type { MetadataRoute } from "next";

import { articles, services } from "@/lib/content";
import { absoluteUrl } from "@/lib/seo";
import { getPublishedArticles } from "@/server/articles/public";

// Railway's private network is available at runtime, not while the image builds.
export const dynamic = "force-dynamic";

const staticPages = [
  "/",
  "/hakkimda",
  "/hizmetler",
  "/makaleler",
  "/sik-sorulan-sorular",
  "/iletisim",
  "/kvkk-aydinlatma-metni",
  "/ilgili-kisi-basvurusu",
  "/gizlilik-politikasi",
  "/cerez-politikasi",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let databaseArticles: Awaited<ReturnType<typeof getPublishedArticles>> = [];
  try {
    databaseArticles = await getPublishedArticles();
  } catch {
    console.error("Sitemap database articles unavailable", {
      failureCode: "DATABASE_UNAVAILABLE",
    });
  }
  const staticSlugs = new Set(articles.map((article) => article.slug));
  return [
    ...staticPages.map((path, index) => ({
      url: absoluteUrl(path),
      changeFrequency: index === 0 ? ("weekly" as const) : ("monthly" as const),
      priority: index === 0 ? 1 : 0.7,
    })),
    ...services.map((service) => ({
      url: absoluteUrl(`/hizmetler/${service.slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...articles.map((article) => ({
      url: absoluteUrl(`/makaleler/${article.slug}`),
      lastModified: article.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...databaseArticles
      .filter((article) => !staticSlugs.has(article.slug))
      .map((article) => ({
        url: absoluteUrl(`/makaleler/${article.slug}`),
        lastModified: article.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.7,
        ...(article.coverImageUrl ? { images: [article.coverImageUrl] } : {}),
      })),
  ];
}
