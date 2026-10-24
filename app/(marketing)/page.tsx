import { BookOpen, GraduationCap, Link2, Search, Shield } from "lucide-react";
import Link from "next/link";
import { ExampleDemo } from "@/components/marketing/example-demo";
import { CallIllustration, PhoneShieldIllustration } from "@/components/marketing/illustrations";
import { ButtonLink } from "@/components/ui/button";

const stages = [
  {
    title: "1. Impersonation",
    text: "Someone claims to be a bank employee or a support agent. Using your name, or naming your bank, does not prove the caller is genuine.",
  },
  {
    title: "2. Pressure",
    text: "They create fear or urgency. They may say the account will be blocked, or that there is an urgent security problem.",
  },
  {
    title: "3. Information request",
    text: "They ask for an OTP, PIN, password, card security code, or other private details. A BVN is different: it does not by itself sign in to an account, but it is sensitive identity information. Do not give it to an unsolicited caller or an unverified website.",
  },
  {
    title: "4. Possible account compromise",
    text: "If you share an OTP, PIN, password, or card security code, the caller may be able to approve an action or get into an account. That is a serious warning sign, not a claim that every call ends this way.",
  },
];

const features = [
  {
    title: "Check suspicious messages",
    text: "Paste a chat or email. TruthLens looks for patterns linked to scams, phishing, pressure, and abusive language, then explains each one.",
    limit: "Suspicious wording is a warning sign. It is not proof that fraud has been confirmed.",
    href: "/check-message",
    cta: "Check a Message",
    icon: Search,
  },
  {
    title: "Inspect suspicious links",
    text: "The checker reads the address for lookalike names, shorteners, and other explainable signs. It does not open the page.",
    limit: "Do not open a questionable link just to test it. A quiet result does not guarantee the site is safe.",
    href: "/check-link",
    cta: "Check a Link",
    icon: Link2,
  },
  {
    title: "Find scholarships and opportunities",
    text: "Browse scholarships, competitions, grants, and internships with eligibility, deadlines, source links, and a verification label.",
    limit: "A listing marked unverified or demonstration has not been confirmed as a current offer. TruthLens does not invent live deadlines.",
    href: "/opportunities",
    cta: "Explore Opportunities",
    icon: GraduationCap,
  },
  {
    title: "Learn digital safety",
    text: "The Academy has short lessons on phishing, links, job and scholarship scams, passwords, bullying, pressure, sharing, and personal information.",
    limit: "A finished lesson is practice. It does not replace asking a trusted adult when money or safety is involved.",
    href: "/academy",
    cta: "Visit the Academy",
    icon: BookOpen,
  },
];

const steps = [
  "Pause. Do not act because someone is hurrying you.",
  "Do not share your OTP, PIN, password, or card security code.",
  "Do not open a suspicious link or install software because an unsolicited caller asked you to.",
  "Contact the organisation yourself, using an official app, a number printed on your card, a website you type, or a branch you already know.",
  "If you already shared a code or a password, contact your bank immediately. Ask it to secure the account and to look at any transaction you do not recognise.",
  "Keep the messages, phone numbers, screenshots, and transaction references. Do not post private details in public.",
  "Tell a trusted adult, a teacher, or an appropriate authority if you need help. Being tricked is not your fault.",
];

const sources = [
  {
    title: "Access Bank: StopFraud",
    href: "https://www.accessbankplc.com/stopfraud",
    text: "Access Bank’s own page says it will not ask for a full card number, PIN, or OTP, and it warns about calls from someone pretending to be the bank. Those contacts are for Access Bank customers, not a number for every bank.",
  },
  {
    title: "Bank of Industry: fraud alert",
    href: "https://onlineportal.boi.ng/pcm/fraud-alert",
    text: "BOI says it will not ask for a BVN, NIN, OTP, PIN, or internet-banking password by phone, email, SMS, or social media. It also says to contact your own bank if you have already shared information.",
  },
  {
    title: "Central Bank of Nigeria",
    href: "https://www.cbn.gov.ng/",
    text: "This is the Central Bank of Nigeria’s website, including its consumer-protection and payments sections. The homepage checked for this page does not itself state an OTP rule, so use it to find official information rather than as a scam verdict.",
  },
];

function PrivacyNote() {
  return (
    <p className="rounded-2xl bg-sun/70 p-4 text-sm leading-6">
      Your safety matters. Never paste your password, full card details, OTP, or unnecessary identity information into an analysis tool. When Gemma 4 is switched on, the text you submit is sent to Google for a separate reading.{" "}
      <Link href="/privacy" className="font-semibold text-primary">
        Read the privacy notice
      </Link>{" "}
      to see how a check is processed and when a report is saved.
    </p>
  );
}

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-16">
      <section className="grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="inline-flex rounded-full bg-sky/30 px-3 py-1 text-sm font-semibold">TruthLens AI for students and young internet users</p>
          <h1 className="mt-4 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
            That call from your bank might not be from your bank.
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8">
            Scammers can pretend to be bank staff, pressure you to reveal sensitive information, or trick you into sharing an OTP. TruthLens AI helps you recognise warning signs in suspicious messages and links, understand why they matter, and choose safer next steps.
          </p>
          <p className="mt-3 max-w-2xl text-sm font-semibold text-muted">
            Understand the warning signs. Verify before you trust. Think before you click.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/check-message">Check a Suspicious Message</ButtonLink>
            <ButtonLink href="#bank-call" variant="secondary">
              Learn How Scams Work
            </ButtonLink>
          </div>
          <p className="mt-4 max-w-xl text-sm leading-6 text-muted">
            Banking calls are one example. TruthLens also looks at scholarship scams, odd links, pressure, and abusive language. It cannot guarantee protection or detect every scam.
          </p>
        </div>
        <PhoneShieldIllustration />
      </section>

      <section id="bank-call" className="mt-16 scroll-mt-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <CallIllustration />
          <div>
            <h2 className="text-3xl font-bold">A scam can begin with one phone call.</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
              Not every unexpected call is a scam. A request for a secret code, plus pressure to act before you can check, is a serious warning sign.
            </p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-ink/5">
            <p className="text-sm leading-7">
              Someone opens a bank account. Later, a caller they did not ask for says they work for the bank. The caller says the account needs verification, or that it may be blocked. They ask the customer to read out an OTP, or to give other private banking details.
            </p>
            <p className="mt-3 text-sm leading-7">
              The caller may use the customer’s name, mention the bank, and sound professional. Those details can be copied. They do not prove the caller is genuine. Banks do not all work in the same way. Check the security advice published by your own bank.
            </p>
          </div>
          <ol className="grid gap-3 sm:grid-cols-2">
            {stages.map((stage) => (
              <li key={stage.title} className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-ink/5">
                <h3 className="font-bold">{stage.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{stage.text}</p>
              </li>
            ))}
          </ol>
        </div>
        <p className="mt-4 rounded-3xl bg-coral/25 p-5 text-sm font-semibold leading-6">
          Never share your OTP, PIN, password, or card security code with an unsolicited caller. End the call and contact your bank using an independently verified official channel.
        </p>
      </section>

      <section className="mt-16" aria-labelledby="spot-heading">
        <h2 id="spot-heading" className="text-3xl font-bold">Can you spot the warning signs?</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
          Read the fictional message, then reveal the teaching notes. You can also load the same words into the real message checker. That check explains patterns. It does not prove who sent a message.
        </p>
        <div className="mt-5 grid gap-4">
          <ExampleDemo />
          <PrivacyNote />
        </div>
      </section>

      <section className="mt-16" aria-labelledby="features-heading">
        <h2 id="features-heading" className="text-3xl font-bold">What TruthLens AI does</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article key={feature.title} className="flex flex-col rounded-3xl bg-white p-5 shadow-sm ring-1 ring-ink/5">
                <Icon aria-hidden="true" className="text-primary" />
                <h3 className="mt-3 text-xl font-bold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6">{feature.text}</p>
                <p className="mt-2 text-sm leading-6 text-muted">{feature.limit}</p>
                <ButtonLink href={feature.href} variant="secondary" className="mt-4 w-fit">
                  {feature.cta}
                </ButtonLink>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-16 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-ink/5 sm:p-6">
        <h2 className="text-3xl font-bold">What to do if you think you are being scammed</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
          Pause first. Asking for help is the right step. This list is general guidance, not a promise that every bank uses the same process.
        </p>
        <ol className="mt-5 grid gap-3 md:grid-cols-2">
          {steps.map((step, index) => (
            <li key={step} className="rounded-2xl bg-canvas p-4 text-sm leading-6">
              <span className="font-bold">{index + 1}. </span>
              {step}
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-16 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/5">
          <h2 className="text-2xl font-bold">How TruthLens works</h2>
          <ol className="mt-4 space-y-3 text-sm leading-6">
            <li><span className="font-semibold">1. Paste a message or enter a link.</span> Leave out passwords, OTPs, and identity numbers.</li>
            <li><span className="font-semibold">2. TruthLens checks supported warning indicators.</span> The rules are explained in plain language. An optional model score, when it is available, is shown separately.</li>
            <li><span className="font-semibold">3. You see what was found and what is still uncertain.</span> A match is not proof. No match is not a guarantee.</li>
            <li><span className="font-semibold">4. You verify important claims yourself.</span> TruthLens is an aid. It does not replace your bank’s security systems or your own judgement.</li>
          </ol>
        </div>
        <aside className="rounded-3xl bg-sky/20 p-6">
          <Shield aria-hidden="true" className="text-primary" />
          <h2 className="mt-3 text-xl font-bold">Practise, then explore</h2>
          <p className="mt-2 text-sm leading-6">
            The Academy is free to read without an account. The opportunity cards show the source and whether a listing has been checked. Demonstration cards are fictional.
          </p>
          <div className="mt-4 flex flex-col gap-3">
            <ButtonLink href="/academy">Visit the Academy</ButtonLink>
            <ButtonLink href="/opportunities" variant="secondary" className="bg-white">
              Explore Opportunities
            </ButtonLink>
          </div>
        </aside>
      </section>

      <section className="mt-16">
        <h2 className="text-3xl font-bold">Learn more from official sources</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
          These organisations published the pages below. TruthLens is not endorsed by a bank, the Bank of Industry, or the Central Bank of Nigeria. The National Identity Management Commission fraud page could not be confirmed when this section was written, so it is not linked here.
        </p>
        <ul className="mt-5 grid gap-4 md:grid-cols-3">
          {sources.map((source) => (
            <li key={source.href} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-ink/5">
              <h3 className="font-bold">
                <a href={source.href} className="text-primary" target="_blank" rel="noopener noreferrer">
                  {source.title}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted">{source.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-16 grid gap-4">
        <PrivacyNote />
        <div className="rounded-3xl bg-primary p-6 text-white">
          <h2 className="text-2xl font-bold">Check before you reply.</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/90">
            You can try a message or a link as a guest. An account is only for saving a private report you can delete later.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/check-message" variant="sun">
              Check a Suspicious Message
            </ButtonLink>
            <ButtonLink href="/signup" variant="secondary">
              Create an account
            </ButtonLink>
          </div>
        </div>
      </section>
    </div>
  );
}
