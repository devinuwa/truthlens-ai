import { MessageChecker } from "@/components/analysis/message-checker";
import { Card } from "@/components/ui/card";
import { getOptionalUser } from "@/lib/auth/current-user";
import { demoMessageFor } from "@/lib/content/demo-message";

export const instant = false;
export const metadata = { title: "Check a message" };

export default async function CheckMessagePage({
  searchParams,
}: {
  searchParams: Promise<{ example?: string }>;
}) {
  const params = await searchParams;
  const initialText = demoMessageFor(params.example);
  const user = await getOptionalUser();
  return (
    <Card>
      <h1 className="text-3xl font-bold">Check a message</h1>
      <p className="mt-2 text-sm text-muted">
        Paste or type a message. TruthLens looks at what it asks you to do, then explains the warning signs it can actually see. An uncertain result means there is not enough to judge. A low-risk result still does not prove the sender is real.
      </p>
      {initialText ? (
        <p className="mt-3 rounded-2xl bg-sun/70 p-3 text-sm">
          This box starts with a fictional bank message from the landing page. Nothing has been checked until you press the button. Do not replace it with a real OTP or password.
        </p>
      ) : null}
      <div className="mt-5">
        <MessageChecker signedIn={Boolean(user)} initialText={initialText} />
      </div>
    </Card>
  );
}
