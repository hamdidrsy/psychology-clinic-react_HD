import "server-only";

export type HeaderReader = { get(name: string): string | null };

function normalizeAuthority(value: string | null) {
  return value?.split(",")[0]?.trim().toLocaleLowerCase("en-US") ?? null;
}

export function hasValidRequestOrigin(
  headers: HeaderReader,
  trustProxyHeaders = false,
) {
  const origin = headers.get("origin");
  if (!origin) return false;

  let originHost: string;
  try {
    originHost = new URL(origin).host.toLocaleLowerCase("en-US");
  } catch {
    return false;
  }

  const requestHost = trustProxyHeaders
    ? (normalizeAuthority(headers.get("x-forwarded-host")) ??
      normalizeAuthority(headers.get("host")))
    : normalizeAuthority(headers.get("host"));
  return Boolean(requestHost && originHost === requestHost);
}

export function trustedClientAddress(
  headers: HeaderReader,
  trustProxyHeaders: boolean,
) {
  if (!trustProxyHeaders) return null;
  return (
    normalizeAuthority(headers.get("cf-connecting-ip")) ??
    normalizeAuthority(headers.get("x-real-ip")) ??
    normalizeAuthority(headers.get("x-forwarded-for"))
  );
}
