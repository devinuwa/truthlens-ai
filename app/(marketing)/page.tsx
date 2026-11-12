import { Suspense } from "react";
import Link from "next/link";
import { LandingChecker, LoadExample } from "@/components/marketing/landing-checker";
import { ButtonLink } from "@/components/ui/button";
import { getOptionalUser } from "@/lib/auth/current-user";

export const metadata = {
  title: "TruthLens AI",
  description: "Check a suspicious message, link, screenshot, or PDF before you act. TruthLens explains warning signs and what is still uncertain.",
};

const threats = [
  ["Phishing", "Messages that ask you to send a code, password, or identity number."],
  ["Bank impersonation", "Someone claiming to be your bank, especially with a threat to close the account."],
  ["Scholarship scams", "An unexpected award that asks for a fee, secrecy, or a personal account."],
  ["Fake jobs", "Recruitment that asks you to pay for a test, uniform, or slot."],
  ["Payment fraud", "Gift cards, airtime, or a transfer to keep money 'safe'."],
  ["Misleading links", "Shortened addresses and names that imitate a real site. The link is not opened."],
  ["Social engineering", "Pressure, flattery, or a request to hide the conversation from an adult."],
];

const reasons = [
  ["Evidence you can see", "Quotes come from the message or the file. A logo is not treated as proof of the sender."],
  ["A plain explanation", "The result says what the wording asks you to do, in language a student can use."],
  ["A next step", "The report says what to avoid and how to check the organisation yourself."],
  ["Room for uncertainty", "When the message is too short or unclear, the result stays uncertain."],
];

const faqs = [
  ["Does a low-risk result mean the message is genuine?", "No. It means the wording did not ask for money, a code, or secrecy. TruthLens cannot see who sent it."],
  ["Do you open the links I paste?", "No. The address is inspected. The website is not visited."],
  ["Are screenshots and PDFs stored?", "No. The file is read for words, checked, and then discarded. A guest check is not written to the database."],
  ["Who is TruthLens for?", "Students and young people who want a pause before they reply, pay, or tap a link. You can check as a guest."],
  ["Is TruthLens endorsed by a bank or a government agency?", "No. Official pages are linked so you can read them yourself. They are not a partnership."],
];

const sources = [
  {
    title: "Access Bank: StopFraud",
    href: "https://www.accessbankplc.com/stopfraud",
    text: "Access Bank’s page says it will not ask for a full card number, PIN, or OTP, and it warns about calls from someone pretending to be the bank.",
  },
  {
    title: "Bank of Industry: fraud alert",
    href: "https://onlineportal.boi.ng/pcm/fraud-alert",
    text: "BOI says it will not ask for a BVN, NIN, OTP, PIN, or internet-banking password by phone, email, SMS, or social media.",
  },
  {
    title: "Central Bank of Nigeria",
    href: "https://www.cbn.gov.ng/",
    text: "The Central Bank of Nigeria site, including consumer-protection and payments pages. Use it to find official information. It is not a verdict on a message.",
  },
];

export default function HomePage() {
  return (
    <div>
      <section className="px-4 pb-6 pt-8 text-center sm:pt-14">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-bold text-primary">Scam-risk check for students</p>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-balance sm:text-6xl sm:leading-[0.98]">
            Think it might be a{" "}
            <span className="relative mx-1 inline-block px-2 text-primary">
              scam
              <span aria-hidden="true" className="pointer-events-none absolute -inset-y-1 -left-1 -right-1 rounded-[50%] border-[3px] border-primary/50" />
            </span>
            ? Check before you act.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8">
            Analyse suspicious messages, links, job offers and scholarship opportunities. Understand the warning signs and know what to do next.
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted">
            A result is a risk reading of the wording you provide. It cannot guarantee that a message, person, website, or opportunity is legitimate.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink href="#check">Check a message</ButtonLink>
            <ButtonLink href="/academy" variant="secondary">Open the Academy</ButtonLink>
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-3xl text-left">
          <Suspense fallback={<div className="h-80 animate-pulse rounded-[28px] bg-white" aria-busy="true" />}>
            <LandingCheckerSlot />
          </Suspense>
        </div>
      </section>
      <div className="mx-auto max-w-6xl px-4 pb-16">

      <section className="mt-16 grid items-center gap-8 lg:grid-cols-2" aria-labelledby="how-heading">
        <div>
          <h2 id="how-heading" className="text-4xl font-extrabold tracking-tight">How TruthLens works</h2>
          <p className="mt-4 max-w-xl text-lg leading-8">
            Paste what you were sent, see the warning signs in the wording, and get a next step you can actually use.
          </p>
          <ul className="mt-6 space-y-3 text-sm font-semibold">
            {["The wording is checked for pressure, money, and secrecy.", "Quotes come from the text you provided.", "A quiet result still does not prove who sent it."].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span aria-hidden="true" className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-lilac text-sm text-primary">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <ol className="grid gap-3 rounded-[32px] bg-lilac p-4 sm:p-6">
          {[
            ["Submit", "Paste a message, enter an address, or add a screenshot or PDF. Leave out passwords and identity numbers."],
            ["Analyse", "The same checks look for a harmful request, pressure, a hidden link, or a threat. An optional reading explains that evidence."],
            ["Understand", "You see the risk, the quotes, what is still unknown, and a practical next step. No match is not a guarantee."],
          ].map(([title, text], index) => (
            <li key={title} className="rounded-[24px] bg-white p-5">
              <p className="text-sm font-bold text-primary">{index + 1}</p>
              <h3 className="mt-1 text-xl font-extrabold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-20" aria-labelledby="identify-heading">
        <h2 id="identify-heading" className="text-4xl font-extrabold tracking-tight">What TruthLens can help you notice</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">These are patterns in the wording. They are not a finding that a crime has been confirmed.</p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {threats.map(([title, text]) => (
            <li key={title} className="rounded-3xl bg-white p-5 shadow-[0_18px_50px_-32px_rgba(80,40,120,0.55)]">
              <h3 className="font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-20 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]" aria-labelledby="preview-heading">
        <div>
          <h2 id="preview-heading" className="text-4xl font-extrabold tracking-tight">What a report looks like</h2>
          <p className="mt-2 text-sm leading-6 text-muted">This card is a fictional illustration of the report shape. It is not a live score. Run the example in the checker if you want the real reading.</p>
          <article className="mt-5 rounded-3xl bg-white p-5 shadow-sm shadow-[0_18px_50px_-32px_rgba(80,40,120,0.55)]">
            <p className="text-sm font-semibold text-danger">High risk · Scholarship scam</p>
            <p className="mt-3 text-sm leading-6">A scholarship message that asks for a fee today, paid to a personal account.</p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6">
              <li>It asks for an upfront payment.</li>
              <li>It asks for the payment today.</li>
              <li>The account is described as personal.</li>
            </ul>
            <p className="mt-3 text-sm leading-6 text-muted">Still unknown: who sent it, and whether any official page asks for that fee. TruthLens does not contact the organisation.</p>
            <LoadExample label="Check this kind of message" text="Congratulations! You have been shortlisted for a Federal Government scholarship. Pay N5000 processing fee today to secure your slot. Send payment to this personal account." />
          </article>
        </div>
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight">Why use it</h2>
          <ul className="mt-5 space-y-3">
            {reasons.map(([title, text]) => (
              <li key={title} className="rounded-3xl bg-white p-5 shadow-[0_18px_50px_-32px_rgba(80,40,120,0.55)]">
                <h3 className="font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-20 rounded-3xl bg-white p-6 shadow-sm shadow-[0_18px_50px_-32px_rgba(80,40,120,0.55)] sm:p-8" aria-labelledby="academy-heading">
        <h2 id="academy-heading" className="text-4xl font-extrabold tracking-tight">Digital Safety Academy</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6">
          Short lessons on pressure, phishing, passwords, scholarship and job scams, social media, and what to keep private. The first lesson is open. The next one opens after a signed-in quiz is passed.
        </p>
        <ButtonLink href="/academy" className="mt-5">Open the Academy</ButtonLink>
      </section>

      <section className="mt-20" aria-labelledby="faq-heading">
        <h2 id="faq-heading" className="text-4xl font-extrabold tracking-tight">Questions</h2>
        <div className="mt-5 space-y-3">
          {faqs.map(([question, answer]) => (
            <details key={question} className="rounded-3xl bg-white p-5 shadow-[0_18px_50px_-32px_rgba(80,40,120,0.55)]">
              <summary className="cursor-pointer font-semibold">{question}</summary>
              <p className="mt-2 text-sm leading-6 text-muted">{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-20" aria-labelledby="care-heading">
        <h2 id="care-heading" className="text-4xl font-extrabold tracking-tight">Privacy and careful use</h2>
        <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl bg-sun/50 p-5 text-sm leading-6">
            <p>Do not paste a password, a full card number, an OTP, or a BVN if you can avoid it. Guest checks are not saved. A signed-in report stores the result, and the message or the words read from a file only if you tick that option.</p>
            <p className="mt-3">When a Gemini key is set, the text you check is sent to Google for the reading. A screenshot, or a picture from a scanned PDF page, is sent so the words can be copied. The PDF file itself is not sent. Uploaded files are not given a public address and are not kept after the check.</p>
            <p className="mt-3">If you already sent money or a code, contact your bank through its own app or the number on your card. If someone is threatening you, keep the message and tell a trusted adult. You are not to blame for being pressured.</p>
            <Link href="/privacy" className="mt-3 inline-flex min-h-11 items-center font-semibold text-primary">Read the privacy notice</Link>
          </div>
          <ul className="space-y-3">
            {sources.map((source) => (
              <li key={source.href} className="rounded-3xl bg-white p-4 shadow-[0_18px_50px_-32px_rgba(80,40,120,0.55)]">
                <a href={source.href} className="font-semibold text-primary" target="_blank" rel="noopener noreferrer">
                  {source.title}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
                <p className="mt-1 text-sm leading-6 text-muted">{source.text}</p>
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-4 text-sm text-muted">TruthLens is not endorsed by Access Bank, the Bank of Industry, or the Central Bank of Nigeria.</p>
      </section>

      <section className="mt-20 rounded-[32px] bg-lilac px-6 py-10">
        <h2 className="text-4xl font-extrabold tracking-tight">Check before you reply.</h2>
        <p className="mt-3 max-w-2xl text-base leading-7">A guest check is enough to start. An account is only for a private report you can delete.</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="#check">Check something now</ButtonLink>
          <ButtonLink href="/signup" variant="secondary">Create an account</ButtonLink>
        </div>
      </section>
      </div>
    </div>
  );
}

async function LandingCheckerSlot() {
  const user = await getOptionalUser();
  return <LandingChecker signedIn={Boolean(user)} />;
}
