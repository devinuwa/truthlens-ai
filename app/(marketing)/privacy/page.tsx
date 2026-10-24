export const metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold">Privacy</h1>
      <div className="mt-4 space-y-4 text-sm leading-6">
        <p>TruthLens is built to collect as little as possible.</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Guest checks are processed to produce a result and are not written to the database.</li>
          <li>A saved report stores the result, the time, the category, the indicators, and an optional label. The message itself is stored only if you tick that option, and then only a short excerpt.</li>
          <li>Reports and saved opportunities are private to the signed-in account. There is no public profile or leaderboard.</li>
          <li>The app does not ask for your school, phone number, or exact location.</li>
          <li>Continue with Gmail asks Google for the name and email on the account you choose. TruthLens does not receive the Gmail password.</li>
          <li>There is no advertising tracker in this project.</li>
          <li>If a Gemini API key is set on the server, the message or link you check is sent to Google's Gemini API so Gemma 4 can add a separate reading. TruthLens does not store that text from a guest check. Google handles the request under its own terms. The Gmail sign-in setup uses a different Google credential, and that credential is not the Gemma key.</li>
          <li>If the operator sets a model-service address instead, the text or link you check is sent to that service. Leave both unset to keep checks inside this app.</li>
        </ul>
        <p>
          Signed-in users can delete reports. Supabase stores the account email so you can sign in. This project cannot promise absolute confidentiality beyond what the hosting and database providers provide.
        </p>
        <p>If a situation involves money, threats, or personal safety, tell a trusted adult or a suitable authority. The app is not an emergency service.</p>
      </div>
    </article>
  );
}
