# Threat model

## Assets

- Account email and display name
- Private analysis reports and optional excerpts
- Saved opportunities and quiz scores
- The Supabase service-role key
- The trust a student places in a result

## Actors

- The student, including a guest
- Another signed-in student
- Someone who sends the student a malicious message or link
- An operator with the service-role key

## Assumptions

- Supabase Auth issues the session.
- The anon key is public, and RLS is the database boundary.
- The service-role key is available only on the server.
- The model URL, if set, is chosen by the operator.

## What we try to prevent

| Risk | Control |
| --- | --- |
| One student reads another's report | Queries include `user_id` from `getUser()`, and RLS repeats that check |
| A client writes an opportunity | No insert policy for `authenticated`. Admin route checks `ADMIN_EMAILS` and uses the service role |
| Open redirect after email confirmation | `safeNext` allows only a same-site relative path |
| Server-side request of a pasted link, including cloud metadata or localhost | The checker parses the address and returns text. It does not call `fetch` |
| Unsupported schemes such as `javascript:` or `file:` | Rejected before analysis |
| Secrets in the browser bundle | Service role is read only in `lib/supabase/admin.ts`, which imports `server-only` |
| Storing a full private message by default | Excerpt is stored only when `storeSource` is true, and it is cut to 280 characters |
| Treating a model score as proof | The response keeps rule indicators and the model note in separate fields |
| Error responses leaking stack traces | Handlers return a short sentence |

## Residual risk

- The in-memory rate limit resets on each server instance. It is not a global quota.
- RLS has not been executed against a live project in this build. Apply the migration and test with two users.
- If `TRUTHLENS_ML_URL` points at a server you do not control, message text leaves this app.
- If `GEMINI_API_KEY` is set, the checked message or link is sent to Google's Gemini API for the Gemma 4 reading. The key must stay server-side.
- Rules can miss a new scam or flag a harmless sentence.
- A stolen session cookie can act as the user until it expires. Supabase cookie options are the session boundary.
- This app cannot promise confidentiality beyond the hosts you configure.

## Out of scope

We do not try to identify the sender, recover stolen money, or decide that a public claim is false.
