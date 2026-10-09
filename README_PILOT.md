# GreenFlare 2.0 — UNIBEN pilot

This ZIP is an updated Next.js 16 source application. It is **not** a cPanel static-site ZIP; deploy to a Node-capable Next.js host. The Supabase project is separate and its SQL must be applied manually.

## Installation
1. Back up the Supabase project first, especially existing `profiles` and `submissions` data.
2. Supabase Dashboard → SQL Editor → run `supabase/migrations/20261008_greenflare_pilot.sql` after reviewing it. This migrates/extends `profiles` and creates pilot tables + RLS + security-definer RPCs. Do not delete the existing submissions table.
3. Supabase Auth → URL Configuration: set production Site URL, and include `https://YOUR_DOMAIN/auth/callback` as a redirect URL. Standard Supabase signup confirmation remains enabled. Configure Supabase email templates to point to the redirect as needed.
4. Copy `.env.example` to `.env.local`; fill required keys. Keep `SUPABASE_SERVICE_ROLE_KEY` server-only. Never prefix it with `NEXT_PUBLIC_`.
5. `npm ci && npm run build && npm run start` (or deploy to Vercel). The project requires Node.js 20.9+.
6. In Supabase SQL Editor, grant admin privilege to an existing **verified** account: `insert into public.gf_admins(user_id) select id from auth.users where email='you@example.com' on conflict do nothing;`. Visit `/admin` using that account to register bins. Do not use the old `ADMIN_PASSWORD`.
7. Click **Print QR sticker** for each registered bin. QR URLs encode the deployed site's origin. If printing on localhost, QR links will point to localhost; use the production admin URL.
8. Grant camera permission on HTTPS. The built-in QR detector depends on browser `BarcodeDetector` support. On unsupported browsers, use the native phone camera to scan the QR URL or manually enter code. This is an explicitly documented limitation, not a guaranteed cross-browser scanner.

## Resend edge function
Deploy with Supabase CLI: `supabase functions deploy send-email --no-verify-jwt`.
Set Edge Function secrets: `RESEND_API_KEY`, `RESEND_FROM_EMAIL` (verified Resend domain/sender) and a long random `GREENFLARE_EMAIL_FUNCTION_SECRET`.
The function requires exact `Authorization: Bearer <GREENFLARE_EMAIL_FUNCTION_SECRET>` and accepts `{ "to":"student@example.org", "subject":"Welcome", "text":"..." }`. **Do not expose the secret to the browser**. Call from trusted backend jobs only. `--no-verify-jwt` is necessary because the function authenticates using its own separate shared secret. Ensure the shared secret is high entropy and rotate it if exposed. Implement server-side templates and a rate-limited notification queue before automating high-volume emails. Existing Supabase Auth confirmation emails remain under Supabase until SMTP is explicitly reconfigured later.

## Security and pilot limitations
- Legacy `/api/admin/approve`, `/api/admin/auth`, `/api/submit` now return HTTP 410; on-chain minting/anonymous submission are switched off. Original tables and blockchain dependencies are retained only for migration reference.
- `gf_record_recycling` uses `auth.uid()` in a transaction, enforces a 10-minute cross-bin cooldown and 12 rewarded actions per day, then writes the score wallet and action atomically. `gf_purchase_item` serializes credit deductions and garden placement. Clients cannot directly insert scores.
- QR codes are static and **do not prove a physical deposit**. There is no reliable physical verification without attendants, dynamic codes, or collection audits. Keep rewards low-stakes; review scans against collection volumes. Avoid claims of confirmed kg/CO₂ impact.
- Leaderboards use public participant usernames and wallet totals; hostel rankings use average score among enrolled students in each hostel. For larger pilots replace the current client aggregation with paginated server-side aggregate views.
- Current dashboard recent actions fetches up to 50 actions, so total count shown is 50+ at the cap and the streak is derived only from that window. For production analytics use dedicated aggregate SQL views.
- The Resend gateway is provided and deployable but automatic notification delivery, retries and opt-in management are not yet wired up. This avoids unintentionally sending unsolicited mail; add a durable queue before enabling event-triggered notifications.
- Existing `profiles` schema may have constraints or differing column types not shown in the source ZIP. Run the migration on a Supabase branch or backup first and resolve any conflicts before production.

## Mobile QR scanning update (October 2026)

The in-app scanner at `/scan` now uses `html5-qrcode` (rather than native
`BarcodeDetector`) to support camera-based scanning in compatible iPhone Safari
and Android Chrome browsers. The QR sticker admin endpoint generates QR images
server-side using the `qrcode` npm package rather than loading a third-party CDN.

From the project root, run `npm install` to download the new dependencies and
refresh the lockfile. Then run `npm run build`. This ZIP was not build-tested
with dependencies installed; test the build locally before deployment.

On mobile, serve the app over HTTPS; local `localhost` is also a secure context.
Allow camera permission, then open `/scan` and tap **Open QR camera**. In addition,
a phone's native Camera app can scan the printed QR URL to navigate directly to
`/scan?bin=...` (users still have to confirm to record an action).

The scanner intentionally rejects external QR URLs and unrecognized codes.
Use a *public HTTPS application domain* to generate/print stickers; sticker
URLs generated on localhost will point to localhost and won't work for students.

The npm `qrcode` package **generates** stickers; `html5-qrcode` **scans** them.
Neither package is a physical deposit-verification solution. Keep anti-abuse
controls, monitoring, and audit processes in place for the pilot.

## Admin-managed bin categories (update)

Run the migrations **in order** in the Supabase SQL Editor:

1. `supabase/migrations/20261008_greenflare_pilot.sql` (only for a fresh pilot install; don't re-run on an existing installation without reviewing changes).
2. `supabase/migrations/20261008_greenflare_admin_categories.sql` (for both new and already-upgraded installations).

In `/admin`, use **Waste categories** to add categories such as Tin Cans, Plastic, or General Waste. The category name becomes an option in **Register a recycling bin**. Category codes are stable database identifiers and cannot be renamed once created; display names and descriptions can be edited. Disabling a category prevents new bins from using it. First deactivate any active bins assigned to the category. Existing historical actions are retained. Only authorized admins can manage categories through the protected API.

Requires `SUPABASE_SERVICE_ROLE_KEY` to be configured on the server; never expose this key in browser-side environment variables. Run `npm install` then `npm run build` locally before deploying. QR camera access on mobile requires HTTPS.


## GreenFlare whole-application design pass — 8 October 2026

The public homepage now includes a full initiative narrative, participation instructions, UNIBEN pilot explainer, mission, FAQs and CTA sections. The student dashboard now has a mobile-friendly seven-day activity visualization, per-user stats, daily goal ring, milestones and real empty states. The leaderboard has podium and hostel rankings; student profiles display unlocked milestones; My Green World has a richer garden canvas. Admin pages now include operational summary tiles and an editable bin-details form (the QR code identifier remains stable). **All activity values are loaded from Supabase rather than invented demo data.**

### Migration sequence

Run the following in Supabase SQL Editor **only if not previously applied**, and back up your database first:

1. `supabase/migrations/20261008_greenflare_pilot.sql`
2. `supabase/migrations/20261008_greenflare_admin_categories.sql`
3. `supabase/migrations/20261008_greenflare_profile_compatibility.sql` — additionally supports legacy profiles with different `id` and `auth_user_id`, and aligns the leaderboard and recycling RPC.

If the first two migrations already ran successfully, **only run the third**. Do not remove duplicate profiles or disable unique constraints. The third migration adjusts policies and functions; it does not alter existing profile rows.

### Local development and build

Run `npm install`, copy `.env.example` to `.env.local` and set your own Supabase values. The service-role key is **server only**. Run `npm run build` and `npm run dev`. Dependency installation could not complete in the packaging environment, so this build is **not certified**; TypeScript/TSX syntax was checked, but you must verify integration against your Supabase project. Test camera permission in iPhone Safari and Android Chrome on HTTPS. Public QR sticker links must be printed from the final public domain, not localhost.

### Still intentionally not automatic

- Scanning proves the bin identifier was read, not that a physical deposit was made. Pilot audits remain necessary.
- Resend's secured Edge Function is included, but event-triggered delivery and signup SMTP configuration are not automatically enabled.
- Hostel names remain an onboarding list, while bin material categories can be managed by admin.
- The garden uses a polished 2D plot board, not a complete Sims-style environment or 3D game.
- The in-app environmental scores are not verified weight or CO₂ measurements.
