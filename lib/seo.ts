import type { Metadata } from "next";

import { clientEnv } from "@/lib/env/client";

export const siteName = "Hasan Durusoy";
export const defaultDescription =
  "Hasan Durusoy psikoloji kliniği; hizmetler, bilgilendirici makaleler ve güvenli randevu talebi.";

export function absoluteUrl(path = "/") {
  return new URL(path, `${clientEnv.NEXT_PUBLIC_SITE_URL}/`).toString();
}

export function pageMetadata({
  title,
  description,
  path,
  type = "website",
}: {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type,
      locale: "tr_TR",
      siteName,
      title,
      description,
      url: path,
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: `${title} | ${siteName}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/opengraph-image"],
    },
  };
}

export function articleMetadata({
  title,
  description,
  path,
  publishedTime,
  modifiedTime,
  author,
  image,
}: {
  title: string;
  description: string;
  path: string;
  publishedTime?: string;
  modifiedTime: string;
  author: string;
  image?: string;
}): Metadata {
  const socialImage = image ?? "/opengraph-image";
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      locale: "tr_TR",
      siteName,
      title,
      description,
      url: path,
      publishedTime,
      modifiedTime,
      authors: [author],
      images: [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage],
    },
  };
}
