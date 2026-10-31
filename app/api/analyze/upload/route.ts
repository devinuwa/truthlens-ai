import { NextResponse } from "next/server";
import { clientKeyFromHeaders, takeRateLimit } from "@/lib/security/rate-limit";
import { assessUpload } from "@/lib/uploads/assess";
import { UploadRejectedError, checkUpload } from "@/lib/uploads/files";

export const maxDuration = 60;

export async function POST(request: Request) {
  const limit = takeRateLimit(clientKeyFromHeaders(request.headers.get("x-forwarded-for")));
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many checks in a short time. Wait a moment and try again." },
      { status: 429, headers: { "retry-after": String(limit.retryAfterSeconds) } },
    );
  }

  const declared = Number(request.headers.get("content-length") || 0);
  if (declared > 12 * 1024 * 1024) {
    return NextResponse.json({ error: "That upload is too large." }, { status: 413 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Send the file as form data." }, { status: 400 });
  }

  const selected = form.getAll("files").filter((item): item is File => item instanceof File && item.size > 0);
  if (selected.length === 0) {
    return NextResponse.json({ error: "Choose a PNG, JPG, WEBP, or PDF." }, { status: 400 });
  }

  try {
    const checked = [];
    for (const file of selected) {
      const bytes = new Uint8Array(await file.arrayBuffer());
      checked.push(checkUpload({ name: file.name, type: file.type, bytes }));
    }
    const result = await assessUpload(checked);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof UploadRejectedError || (error instanceof Error && /PDF|password|pages|readable/i.test(error.message))) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof Error && /reading did not come back|API key/i.test(error.message)) {
      return NextResponse.json(
        { error: "The file could not be read just now. Try again, or paste the words as text. The file was not stored." },
        { status: 502 },
      );
    }
    return NextResponse.json({ error: "The file could not be checked. Your file was not stored." }, { status: 500 });
  }
}
