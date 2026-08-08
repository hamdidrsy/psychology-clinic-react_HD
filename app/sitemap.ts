import type { MetadataRoute } from "next";

import { articles, services } from "@/lib/content";
import { absoluteUrl } from "@/lib/seo";
import { getPublishedArticles } from "@/server/articles/public";

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
  const databaseArticles = await getPublishedArticles();
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
