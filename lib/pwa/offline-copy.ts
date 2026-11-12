export function checkUnreachable(detail: string): string {
  const offline = typeof navigator !== "undefined" && navigator.onLine === false;
  const lead = offline
    ? "You are offline. A check needs a connection."
    : "The check could not reach the server.";
  return `${lead} ${detail}`;
}
