export const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;
export const PDF_TYPE = "application/pdf";
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_PDF_BYTES = 10 * 1024 * 1024;
export const MAX_IMAGES = 3;
export const MAX_PDF_PAGES = 5;

export type CheckedFile = {
  name: string;
  mime: "image/png" | "image/jpeg" | "image/webp" | "application/pdf";
  bytes: Uint8Array;
};

export class UploadRejectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UploadRejectedError";
  }
}

export function checkUpload(file: { name: string; type: string; bytes: Uint8Array }): CheckedFile {
  if (file.bytes.byteLength === 0) {
    throw new UploadRejectedError(`${label(file.name)} is empty.`);
  }
  const mime = signatureMime(file.bytes);
  if (!mime) {
    throw new UploadRejectedError(`${label(file.name)} is not a PNG, JPG, WEBP, or PDF, or the file is damaged.`);
  }
  const claimed = file.type.trim().toLowerCase();
  if (claimed && claimed !== mime && claimed !== "application/octet-stream") {
    throw new UploadRejectedError(`${label(file.name)} says it is ${claimed}, but the contents are ${mime}.`);
  }
  const limit = mime === PDF_TYPE ? MAX_PDF_BYTES : MAX_IMAGE_BYTES;
  if (file.bytes.byteLength > limit) {
    const mb = mime === PDF_TYPE ? 10 : 5;
    throw new UploadRejectedError(`${label(file.name)} is too large. The limit is ${mb} MB.`);
  }
  return { name: file.name || "upload", mime, bytes: file.bytes };
}

export function signatureMime(bytes: Uint8Array): CheckedFile["mime"] | null {
  if (starts(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  if (starts(bytes, [0xff, 0xd8, 0xff])) return "image/jpeg";
  if (starts(bytes, [0x52, 0x49, 0x46, 0x46]) && bytes.length >= 12 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
    return "image/webp";
  }
  if (starts(bytes, [0x25, 0x50, 0x44, 0x46])) return "application/pdf";
  return null;
}

function starts(bytes: Uint8Array, prefix: number[]): boolean {
  if (bytes.length < prefix.length) return false;
  return prefix.every((value, index) => bytes[index] === value);
}

function label(name: string): string {
  const clean = name.replace(/[^\w .()-]/g, "").trim().slice(0, 80);
  return clean || "That file";
}
