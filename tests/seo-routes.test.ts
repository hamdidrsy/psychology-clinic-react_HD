import { beforeEach, describe, expect, it, vi } from "vitest";

const getPublishedArticles = vi.hoisted(() => vi.fn());
vi.mock("@/server/articles/public", () => ({ getPublishedArticles }));

import robots from "@/app/robots";
import sitemap from "@/app/sitemap";

describe("SEO discovery routes", () => {
  beforeEach(() => getPublishedArticles.mockReset());

  it("allows public pages and excludes the admin area in robots", () => {
    const result = robots();
    expect(result.rules).toMatchObject({
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/admin"],
    });
    expect(result.sitemap).toBe("http://localhost:3000/sitemap.xml");
  });

  it("includes published database articles and their images in sitemap", async () => {
    getPublishedArticles.mockResolvedValue([
      {
        slug: "veritabanindan-makale",
        updatedAt: new Date("2026-08-09T12:00:00.000Z"),
        coverImageUrl: "https://cdn.example.com/cover.jpg",
      },
    ]);
    const result = await sitemap();
    expect(result).toContainEqual(
      expect.objectContaining({
        url: "http://localhost:3000/makaleler/veritabanindan-makale",
        images: ["https://cdn.example.com/cover.jpg"],
      }),
    );
  });
});
