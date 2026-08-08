import { headers } from "next/headers";

export function safeJsonLd(value: unknown) {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

export async function JsonLd({ data }: { data: unknown }) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <script
      dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }}
      nonce={nonce}
      type="application/ld+json"
    />
  );
}
