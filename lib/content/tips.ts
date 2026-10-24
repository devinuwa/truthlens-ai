export const SAFETY_TIPS = [
  "A real organisation can wait while you check its official website yourself.",
  "Do not send a password or a one-time code to someone who asks for it in a chat.",
  "If a scholarship asks for a fee in a private message, pause and tell a trusted adult.",
  "The end of a web address, not the words at the start, tells you who owns the site.",
  "You can leave a conversation that feels rushed, secret, or cruel.",
  "A logo can be copied. The request for money or a password is the part to question.",
  "Keep your school, phone number, and home address off public profiles.",
  "If a post has no source, do not share it as a fact.",
];

export function tipForDate(date = new Date()): string {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const day = Math.floor((Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - start) / 86_400_000);
  return SAFETY_TIPS[day % SAFETY_TIPS.length] ?? SAFETY_TIPS[0];
}
