export const BANK_OTP_EXAMPLE_ID = "bank-otp";

export const BANK_OTP_EXAMPLE =
  "URGENT: Your bank account will be suspended today. To reactivate it, reply with the OTP sent to your phone. Do not delay.";

export function demoMessageFor(example: string | undefined): string {
  return example === BANK_OTP_EXAMPLE_ID ? BANK_OTP_EXAMPLE : "";
}
