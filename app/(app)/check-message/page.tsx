import { MessageChecker } from "@/components/analysis/message-checker";
import { Card } from "@/components/ui/card";
import { getOptionalUser } from "@/lib/auth/current-user";

export const instant = false;
export const metadata = { title: "Check a message" };

export default async function CheckMessagePage() {
  const user = await getOptionalUser();
  return (
    <Card>
      <h1 className="text-3xl font-bold">Check a message</h1>
      <p className="mt-2 text-sm text-muted">
        This looks for scam language, phishing requests, fake opportunities, payment asks, urgency, harassment, and manipulation. It explains the patterns it finds. It does not prove a crime, and a quiet result does not mean the message is safe.
      </p>
      <div className="mt-5">
        <MessageChecker signedIn={Boolean(user)} />
      </div>
    </Card>
  );
}
