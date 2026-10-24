"use client";

import { useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { BANK_OTP_EXAMPLE, BANK_OTP_EXAMPLE_ID } from "@/lib/content/demo-message";

const signs = [
  {
    title: "Urgency and pressure",
    text: "“URGENT” and “Do not delay” push you to act before you can think or ask someone you trust.",
  },
  {
    title: "Threat of account suspension",
    text: "The message says the account will be suspended today. Fear is being used to hurry you.",
  },
  {
    title: "Request for an OTP",
    text: "An OTP is a temporary code that can approve a sign-in or a payment. A message should not ask you to send it back.",
  },
  {
    title: "Check the claim yourself",
    text: "The wording is a warning sign, not proof of who sent it. Confirm with your bank through a channel you find yourself.",
  },
];

export function ExampleDemo() {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-ink/5 sm:p-6">
      <p className="inline-flex rounded-full bg-sun px-3 py-1 text-sm font-semibold">Fictional example</p>
      <blockquote className="mt-4 rounded-2xl bg-canvas p-4 text-base leading-7">
        {BANK_OTP_EXAMPLE}
      </blockquote>
      <p className="mt-3 text-sm text-muted">This message was written for teaching. It is not from a bank, and it contains no real code.</p>
      <Button type="button" className="mt-4" aria-expanded={open} aria-controls="warning-signs" onClick={() => setOpen((value) => !value)}>
        {open ? "Hide the warning signs" : "Reveal the warning signs"}
      </Button>
      {open ? (
        <div id="warning-signs" className="mt-4 space-y-3">
          <p className="text-sm font-semibold">Teaching notes for this example. TruthLens has not scored it until you open the checker.</p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {signs.map((sign) => (
              <li key={sign.title} className="rounded-2xl bg-canvas p-4">
                <h3 className="font-bold">{sign.title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted">{sign.text}</p>
              </li>
            ))}
          </ul>
          <div className="rounded-2xl bg-teal/15 p-4 text-sm leading-6">
            <p className="font-bold">What to do instead</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Do not reply with the OTP.</li>
              <li>Do not open a link in the message.</li>
              <li>Contact the bank through its official app, a number on your card, a website you type yourself, or a branch you already know.</li>
              <li>If you already shared an OTP, contact the bank immediately and ask it to secure the account.</li>
            </ul>
          </div>
          <ButtonLink href={`/check-message?example=${BANK_OTP_EXAMPLE_ID}`} variant="secondary">
            Load this example into the checker
          </ButtonLink>
        </div>
      ) : null}
    </div>
  );
}
