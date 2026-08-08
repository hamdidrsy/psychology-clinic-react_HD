import { describe, expect, it } from "vitest";

import { articleFormSchema, slugify } from "@/lib/admin/article-schema";

const valid = {
  title: "Kaygıyla baş etme yolları",
  excerpt: "Yeterince uzun ve açıklayıcı bir makale özeti.",
  content: "## Başlık\n\n" + "Güvenli içerik metni. ".repeat(4),
  status: "DRAFT",
};

describe("article admin schema", () => {
  it("creates stable ASCII slugs", () => {
    expect(slugify("Çevrim İçi Görüşme & Hazırlık")).toBe(
      "cevrim-ici-gorusme-hazirlik",
    );
  });
  it("rejects raw HTML and unsafe links", () => {
    expect(
      articleFormSchema.safeParse({
        ...valid,
        content: `${valid.content}<script>alert(1)</script>`,
      }).success,
    ).toBe(false);
    expect(
      articleFormSchema.safeParse({
        ...valid,
        content: `${valid.content}[tıkla](javascript:alert(1))`,
      }).success,
    ).toBe(false);
  });
  it("rejects a second page-level heading", () => {
    expect(
      articleFormSchema.safeParse({
        ...valid,
        content: `# H1\n\n${valid.content}`,
      }).success,
    ).toBe(false);
  });
  it("requires alt text when a cover image exists", () => {
    expect(
      articleFormSchema.safeParse({
        ...valid,
        coverImageUrl: "https://example.com/image.jpg",
      }).success,
    ).toBe(false);
  });
});
