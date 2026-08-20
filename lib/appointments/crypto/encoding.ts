const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const BASE64URL_PATTERN = /^[A-Za-z0-9_-]+$/;

export class AppointmentCryptoError extends Error {
  constructor(
    public readonly code:
      | "CRYPTO_UNAVAILABLE"
      | "INVALID_INPUT"
      | "INVALID_RECOVERY_FILE"
      | "DECRYPT_FAILED"
      | "UNSUPPORTED_VERSION",
  ) {
    super(code);
    this.name = "AppointmentCryptoError";
  }
}

export function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/g, "");
}

export function base64UrlToBytes(value: string, expectedBytes?: number) {
  if (!value || !BASE64URL_PATTERN.test(value) || value.includes("=")) {
    throw new AppointmentCryptoError("INVALID_INPUT");
  }
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  let binary: string;
  try {
    binary = atob(value.replaceAll("-", "+").replaceAll("_", "/") + padding);
  } catch {
    throw new AppointmentCryptoError("INVALID_INPUT");
  }
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  if (
    (expectedBytes !== undefined && bytes.length !== expectedBytes) ||
    bytesToBase64Url(bytes) !== value
  ) {
    throw new AppointmentCryptoError("INVALID_INPUT");
  }
  return bytes;
}

export function bytesToBase32(bytes: Uint8Array) {
  let result = "";
  let buffer = 0;
  let bits = 0;
  for (const byte of bytes) {
    buffer = (buffer << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      result += BASE32_ALPHABET[(buffer >>> bits) & 31];
    }
    buffer &= (1 << bits) - 1;
  }
  if (bits > 0) result += BASE32_ALPHABET[(buffer << (5 - bits)) & 31];
  return result;
}

export function base32ToBytes(value: string, expectedBytes?: number) {
  if (!value || value !== value.toUpperCase() || !/^[A-Z2-7]+$/.test(value)) {
    throw new AppointmentCryptoError("INVALID_INPUT");
  }
  const output: number[] = [];
  let buffer = 0;
  let bits = 0;
  for (const character of value) {
    const index = BASE32_ALPHABET.indexOf(character);
    buffer = (buffer << 5) | index;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      output.push((buffer >>> bits) & 255);
      buffer &= (1 << bits) - 1;
    }
  }
  if (bits > 0 && buffer !== 0) {
    throw new AppointmentCryptoError("INVALID_INPUT");
  }
  const bytes = Uint8Array.from(output);
  if (
    (expectedBytes !== undefined && bytes.length !== expectedBytes) ||
    bytesToBase32(bytes) !== value
  ) {
    throw new AppointmentCryptoError("INVALID_INPUT");
  }
  return bytes;
}

export function zeroBytes(bytes: Uint8Array) {
  bytes.fill(0);
}
