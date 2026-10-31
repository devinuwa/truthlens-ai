import { describe, expect, it } from "vitest";
import { analyzeMessage } from "@/lib/analysis/message";
import { MAX_IMAGE_BYTES, checkUpload, signatureMime } from "@/lib/uploads/files";
import { pagesToMessage, readPdf } from "@/lib/uploads/pdf-text";

function textPdf(message: string): Uint8Array {
  const safe = message.replace(/[()\\]/g, "");
  const content = `BT /F1 12 Tf 40 700 Td (${safe}) Tj ET\n`;
  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n",
    "2 0 obj << /Type /Pages /Count 1 /Kids [3 0 R] >> endobj\n",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 2000 800] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj\n",
    `4 0 obj << /Length ${content.length} >> stream\n${content}endstream\nendobj\n`,
    "5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n",
  ];
  let body = "%PDF-1.4\n";
  const offsets = [0];
  for (const object of objects) {
    offsets.push(body.length);
    body += object;
  }
  const xrefAt = body.length;
  let table = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let index = 1; index < offsets.length; index += 1) {
    table += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }
  body += `${table}trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefAt}\n%%EOF`;
  return new TextEncoder().encode(body);
}

describe("upload checks", () => {
  it("accepts a PNG signature and rejects a renamed text file", () => {
    const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0]);
    expect(signatureMime(png)).toBe("image/png");
    expect(checkUpload({ name: "note.png", type: "image/png", bytes: png }).mime).toBe("image/png");
    expect(() => checkUpload({ name: "note.png", type: "image/png", bytes: new TextEncoder().encode("hello") })).toThrow(/not a PNG/);
  });

  it("rejects a type that does not match the contents", () => {
    const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0x00]);
    expect(() => checkUpload({ name: "photo.png", type: "image/png", bytes: jpeg })).toThrow(/contents are image\/jpeg/);
  });

  it("rejects an empty file and a file over the image limit", () => {
    expect(() => checkUpload({ name: "empty.png", type: "image/png", bytes: new Uint8Array() })).toThrow(/empty/);
    const png = new Uint8Array(MAX_IMAGE_BYTES + 1);
    png.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    expect(() => checkUpload({ name: "big.png", type: "image/png", bytes: png })).toThrow(/too large/);
  });

  it("reads selectable PDF text in page order and sends it through the message check", async () => {
    const pages = await readPdf(textPdf("Pay the processing fee today to this personal account."));
    expect(pages[0]?.source).toBe("text");
    expect(pages[0]?.page).toBe(1);
    const message = pagesToMessage(pages);
    expect(message).toContain("[Page 1]");
    expect(message).toContain("personal account");
    expect(analyzeMessage(message).brief?.risk).toBe("high");
  });

  it("marks a page with no words as unreadable when no vision reading is available", async () => {
    const pages = await readPdf(textPdf(""));
    expect(pages[0]?.source).toBe("unreadable");
    expect(pagesToMessage(pages)).toBe("");
  });

  it("uses a supplied reading only for a thin page", async () => {
    const pages = await readPdf(textPdf(""), async () => "Send the OTP from your bank account.");
    expect(pages[0]?.source).toBe("vision");
    expect(analyzeMessage(pagesToMessage(pages)).brief?.classification).toBe("account_takeover");
  });

  it("rejects a damaged PDF", async () => {
    const bytes = new TextEncoder().encode("%PDF-1.4\nthis is not a document");
    await expect(readPdf(bytes)).rejects.toThrow(/could not be read/);
  });
});
