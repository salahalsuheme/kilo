export interface ZatcaQrInput {
  sellerName: string;
  vatNumber: string;
  /** ISO 8601 timestamp e.g. 2026-07-14T12:00:00Z */
  timestamp: string;
  /** Total with VAT, 2 decimal places as string */
  totalInclVat: string;
  /** VAT amount, 2 decimal places as string */
  vatAmount: string;
}

function encodeTlv(tag: number, value: string): Uint8Array {
  const valueBytes = new TextEncoder().encode(value);
  const tlv = new Uint8Array(2 + valueBytes.length);
  tlv[0] = tag;
  tlv[1] = valueBytes.length;
  tlv.set(valueBytes, 2);
  return tlv;
}

function concatBytes(chunks: Uint8Array[]): Uint8Array {
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  if (typeof btoa === "function") return btoa(binary);
  const nodeBuffer = (globalThis as { Buffer?: { from(data: Uint8Array): { toString(encoding: "base64"): string } } }).Buffer;
  if (nodeBuffer) return nodeBuffer.from(bytes).toString("base64");
  throw new Error("Base64 encoding is not available in this environment");
}

/** Build ZATCA Phase-1 simplified e-invoice QR payload (TLV → Base64). */
export function buildZatcaQrPayload(input: ZatcaQrInput): string {
  const tlv = concatBytes([
    encodeTlv(1, input.sellerName),
    encodeTlv(2, input.vatNumber),
    encodeTlv(3, input.timestamp),
    encodeTlv(4, input.totalInclVat),
    encodeTlv(5, input.vatAmount),
  ]);
  return bytesToBase64(tlv);
}

export function formatZatcaAmount(value: number): string {
  return value.toFixed(2);
}

export function formatZatcaTimestamp(isoDate: string): string {
  return new Date(isoDate).toISOString();
}
