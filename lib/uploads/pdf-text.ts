import { extractImages, extractText, getDocumentProxy, inspectPages } from "unpdf";
import { MAX_PDF_PAGES } from "@/lib/uploads/files";

export type PdfPage = {
  page: number;
  text: string;
  source: "text" | "vision" | "unreadable";
};

const THIN_PAGE = 24;
const IMAGE_COVERAGE = 0.35;

export async function readPdf(
  bytes: Uint8Array,
  transcribe?: (page: number, images: Uint8Array[]) => Promise<string>,
): Promise<PdfPage[]> {
  let pdf: Awaited<ReturnType<typeof getDocumentProxy>>;
  try {
    pdf = await getDocumentProxy(bytes.slice());
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (/password/i.test(message)) {
      throw new Error("This PDF is password-protected. Remove the password and try again. The file was not opened as a script.");
    }
    throw new Error("This PDF could not be read. It may be damaged.");
  }

  let extracted: { totalPages: number; text: string | string[] };
  try {
    extracted = await extractText(pdf, { mergePages: false });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (/password/i.test(message)) {
      throw new Error("This PDF is password-protected. Remove the password and try again. The file was not opened as a script.");
    }
    throw new Error("This PDF could not be read. It may be damaged.");
  }

  const total = extracted.totalPages;
  if (total < 1) throw new Error("This PDF has no pages.");
  if (total > MAX_PDF_PAGES) {
    throw new Error(`This PDF has ${total} pages. The limit is ${MAX_PDF_PAGES} pages.`);
  }
  const layers = Array.isArray(extracted.text) ? extracted.text : [extracted.text];
  let coverage = new Map<number, number>();
  try {
    const inspection = await inspectPages(bytes.slice());
    coverage = new Map(inspection.pages.map((page, index) => [index + 1, page.imageCoverage]));
  } catch {
    coverage = new Map();
  }

  const pages: PdfPage[] = [];
  for (let index = 0; index < total; index += 1) {
    const page = index + 1;
    const text = (layers[index] ?? "").replace(/\s+/g, " ").trim();
    const needsVision = text.length < THIN_PAGE || (coverage.get(page) ?? 0) >= IMAGE_COVERAGE;
    if (!needsVision) {
      pages.push({ page, text, source: "text" });
      continue;
    }
    const seen = await pageImages(bytes, page);
    let visual = "";
    if (transcribe) visual = (await transcribe(page, seen)).replace(/\s+/g, " ").trim();
    const combined = [text, visual].filter(Boolean).join("\n");
    pages.push({
      page,
      text: combined,
      source: visual ? "vision" : text ? "text" : "unreadable",
    });
  }
  return pages;
}

async function pageImages(bytes: Uint8Array, page: number): Promise<Uint8Array[]> {
  try {
    const images = await extractImages(bytes.slice(), page, { format: "png" });
    return images.map((image) => image.data).filter((data) => data.byteLength > 0).slice(0, 3);
  } catch {
    return [];
  }
}

export function pagesToMessage(pages: PdfPage[]): string {
  return pages
    .filter((page) => page.text)
    .map((page) => `[Page ${page.page}]\n${page.text}`)
    .join("\n\n")
    .slice(0, 4000);
}
