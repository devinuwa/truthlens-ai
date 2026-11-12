import { Suspense } from "react";
import { UrlChecker } from "@/components/analysis/url-checker";
import { Card } from "@/components/ui/card";
import { getOptionalUser } from "@/lib/auth/current-user";

export const metadata = { title: "Check a link" };

export default function CheckLinkPage() {
  return (
    <Card>
      <h1 className="text-3xl font-bold">Check a link</h1>
      <p className="mt-2 text-sm text-muted">
        Paste an http or https address. TruthLens reads the address for explainable warning signs. It does not visit the page, follow redirects, or download files.
      </p>
      <Suspense fallback={<p className="mt-5 text-sm text-muted">Loading the checker…</p>}>
        <CheckLinkBody />
      </Suspense>
    </Card>
  );
}

async function CheckLinkBody() {
  const user = await getOptionalUser();
  return (
    <div className="mt-5">
      <UrlChecker signedIn={Boolean(user)} />
    </div>
  );
}
