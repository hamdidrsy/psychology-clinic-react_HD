export const cookiePreferenceVersion = "2026-08-09-v1";
export const cookiePreferenceKey = "hd-cookie-preferences-v2";

export type CookiePreferences = {
  version: string;
  essential: true;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
};

export function essentialOnlyPreferences(now = new Date()): CookiePreferences {
  return {
    version: cookiePreferenceVersion,
    essential: true,
    analytics: false,
    marketing: false,
    updatedAt: now.toISOString(),
  };
}

export function parseCookiePreferences(value: string | null) {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Partial<CookiePreferences>;
    if (
      parsed.version !== cookiePreferenceVersion ||
      parsed.essential !== true ||
      typeof parsed.analytics !== "boolean" ||
      typeof parsed.marketing !== "boolean" ||
      typeof parsed.updatedAt !== "string"
    ) {
      return null;
    }
    return parsed as CookiePreferences;
  } catch {
    return null;
  }
}
