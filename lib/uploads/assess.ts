import { analyzeMessage } from "@/lib/analysis/message";
import { explainAnalysis } from "@/lib/analysis/providers/explain";
import type { AnalysisResult } from "@/lib/analysis/types";
import { MAX_IMAGES, UploadRejectedError, type CheckedFile } from "@/lib/uploads/files";
import { pagesToMessage, readPdf, type PdfPage } from "@/lib/uploads/pdf-text";
import { transcribeImage } from "@/lib/uploads/transcribe";

export async function assessUpload(files: CheckedFile[]): Promise<AnalysisResult> {
  if (files.length === 0) throw new UploadRejectedError("Choose a PNG, JPG, WEBP, or PDF.");
  const pdfs = files.filter((file) => file.mime === "application/pdf");
  const images = files.filter((file) => file.mime !== "application/pdf");
  if (pdfs.length > 0 && images.length > 0) {
    throw new UploadRejectedError("Check a PDF on its own, or check up to 3 images. Do not mix them in one check.");
  }
  if (pdfs.length > 1) throw new UploadRejectedError("Check one PDF at a time.");
  if (images.length > MAX_IMAGES) throw new UploadRejectedError(`Check up to ${MAX_IMAGES} images at a time.`);

  if (pdfs.length === 1) return assessPdf(pdfs[0]);
  return assessImages(images);
}

async function assessPdf(file: CheckedFile): Promise<AnalysisResult> {
  const pages = await readPdf(file.bytes, async (_page, images) => {
    if (images.length === 0) return "";
    const parts: string[] = [];
    let failures = 0;
    for (const image of images) {
      try {
        const reading = await transcribeImage(image, "image/png");
        if (reading.text) parts.push(reading.text);
      } catch {
        failures += 1;
      }
    }
    if (parts.length === 0 && failures === images.length) {
      throw new Error("The image reading did not come back.");
    }
    return parts.join("\n");
  });
  const text = pagesToMessage(pages);
  if (!text) {
    throw new UploadRejectedError("No readable words were found in this PDF. A scanned page may be blank, blurry, or protected.");
  }
  const result = await explainAnalysis(text, analyzeMessage(text));
  return annotate(result, pdfNote(pages));
}

async function assessImages(files: CheckedFile[]): Promise<AnalysisResult> {
  const parts: string[] = [];
  const missed: number[] = [];
  let providerFailures = 0;
  for (let index = 0; index < files.length; index += 1) {
    try {
      const reading = await transcribeImage(files[index].bytes, files[index].mime);
      if (reading.text) parts.push(`[Image ${index + 1}]\n${reading.text}`);
      else missed.push(index + 1);
    } catch {
      providerFailures += 1;
      missed.push(index + 1);
    }
  }
  const text = parts.join("\n\n").slice(0, 4000);
  if (!text && providerFailures === files.length) {
    throw new Error("The image reading did not come back. Try again, or paste the message as text.");
  }
  if (!text) {
    throw new UploadRejectedError("No readable words were found in the image. Try a clearer screenshot, or paste the message as text.");
  }
  const result = await explainAnalysis(text, analyzeMessage(text));
  const miss = missed.length > 0 ? ` Image ${missed.join(", ")} could not be read.` : "";
  return annotate(result, `Words were read from the image. A logo or layout was not treated as proof of who sent it.${miss}`);
}

function pdfNote(pages: PdfPage[]): string {
  const unreadable = pages.filter((page) => page.source === "unreadable").map((page) => page.page);
  const vision = pages.filter((page) => page.source === "vision").map((page) => page.page);
  const bits = ["Selectable text was read first. A logo or layout was not treated as proof of who sent it."];
  if (vision.length > 0) bits.push(`Page ${vision.join(", ")} had little selectable text, so a reading of that page was added.`);
  if (unreadable.length > 0) bits.push(`Page ${unreadable.join(", ")} could not be read.`);
  return bits.join(" ");
}

function annotate(result: AnalysisResult, note: string): AnalysisResult {
  if (!result.brief) return { ...result, limitations: `${note} ${result.limitations}` };
  return {
    ...result,
    limitations: `${note} ${result.limitations}`,
    brief: {
      ...result.brief,
      missing: [note, ...result.brief.missing].slice(0, 6),
      limitations: `${note} ${result.brief.limitations}`,
    },
  };
}
