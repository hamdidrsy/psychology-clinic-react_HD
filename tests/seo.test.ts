import { describe, expect, it } from "vitest";

import { safeJsonLd } from "@/components/json-ld";
import { absoluteUrl, pageMetadata } from "@/lib/seo";

describe("SEO helpers", () => {
  it("creates absolute canonical URLs from the configured origin", () => {
    expect(absoluteUrl("/makaleler/ornek")).toBe(
      "http://localhost:3000/makaleler/ornek",
    );
  });

  it("sets canonical and social metadata consistently", () => {
    const metadata = pageMetadata({
      title: "Örnek",
      description: "Açıklama",
      path: "/ornek",
    });
    expect(metadata.alternates).toEqual({ canonical: "/ornek" });
    expect(metadata.openGraph).toMatchObject({ url: "/ornek", title: "Örnek" });
  });

  it("escapes script-breaking characters in JSON-LD", () => {
    const serialized = safeJsonLd({ value: "</script>\u2028" });
    expect(serialized).not.toContain("</script>");
    expect(serialized).toContain("\\u003c/script>");
    expect(serialized).toContain("\\u2028");
  });
});
