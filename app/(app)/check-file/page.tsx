import { LandingChecker } from "@/components/marketing/landing-checker";
import { Card } from "@/components/ui/card";
import { getOptionalUser } from "@/lib/auth/current-user";

export const instant = false;
export const metadata = { title: "Check a file" };

export default async function CheckFilePage() {
  const user = await getOptionalUser();
  return (
    <Card>
      <h1 className="text-3xl font-bold">Check a screenshot or PDF</h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        Add a PNG, JPG, or WEBP up to 5 MB, or one PDF up to 10 MB and 5 pages. The words are read and checked with the same assessment as a pasted message. The file is not stored, and a logo is not treated as proof of who sent it.
      </p>
      <div className="mt-5">
        <LandingChecker signedIn={Boolean(user)} mode="file" framed={false} />
      </div>
    </Card>
  );
}
