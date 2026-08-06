import { describe, expect, it } from "vitest";

import { articles, services } from "@/lib/content";

describe("public content routes", () => {
  it("uses unique service slugs", () => {
    const slugs = services.map(({ slug }) => slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("uses unique article slugs and valid related services", () => {
    const articleSlugs = articles.map(({ slug }) => slug);
    const serviceSlugs = new Set(services.map(({ slug }) => slug));
    expect(new Set(articleSlugs).size).toBe(articleSlugs.length);
    expect(
      articles.every(({ relatedServiceSlug }) =>
        serviceSlugs.has(relatedServiceSlug),
      ),
    ).toBe(true);
  });

  it("references existing articles from service pages", () => {
    const articleSlugs = new Set(articles.map(({ slug }) => slug));
    expect(
      services
        .flatMap(({ relatedArticleSlugs }) => relatedArticleSlugs)
        .every((slug) => articleSlugs.has(slug)),
    ).toBe(true);
  });
});
