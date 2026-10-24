<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# TruthLens AI conventions

- Keep the youth-facing copy plain. Do not say a result is completely safe.
- Rule indicators and any model score are separate evidence. Do not hide one inside the other.
- Do not fetch a URL a user pastes. Do not add a server-side client that can reach private addresses.
- Authorise with `getUser()` on the server. Do not trust `getSession()` for access decisions.
- User-owned rows are filtered by the signed-in user id and by RLS. Never read another user's report by an id from the request alone.
- The service-role client lives in `lib/supabase/admin.ts` and is only for the admin opportunity route. Do not import it from a client component.
- Do not commit `.env.local`, service-role keys, datasets, or trained model files.
- Do not invent metrics, scholarships, user counts, or deployment results.
- Route protection uses `proxy.ts`, not `middleware.ts`, on this Next.js version.
