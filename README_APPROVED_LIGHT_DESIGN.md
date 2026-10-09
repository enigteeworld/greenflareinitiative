# GreenFlare — approved light/mobile-first UI implementation

This project is a **complete source replacement**, based on the latest GreenFlare admin-branding package. It preserves the existing Supabase authentication, QR scanning and confirmation workflow, admin registered-bin/category endpoints, wallet scoring RPCs, virtual-garden purchases, SQL migrations and Resend notification Edge Function.

## Visual system

The approved mobile screenshot is the reference for the redesigned visual presentation. The single active stylesheet is `app/gf-light.css`, imported after `app/globals.css` by `app/layout.tsx`. Old conflicting dark/editorial theme stylesheets were removed to prevent future overrides.

Palette:
- Warm ivory background: `#F8F6EF`
- Forest text / headings: `#102C25`
- Forest primary: `#0B3329` / `#105438`
- White/cream panels: `#FFFDFB`
- Soft sky-blue progress: `#5AB4EE`
- Warm amber activity accent: `#F2AD44`
- Muted captions: `#78817D`

The fallback logo/favicon is a circular renewal/flare mark, not a leaf. Admin-uploaded logo, favicon and preloader are still controlled through `/admin`, and the fallback bouncing preloader stays in use when no uploaded asset is configured.

## Screens refactored

- `/account`: simplified Green Score ring, monthly recycling progress, weekly activity, single Scan CTA. No cluttered extra dashboard widgets.
- `/leaderboard`: competition-focused layout with member and community rankings.
- `/garden`: distinct scenic garden with the existing store and purchase RPC preserved.
- `/profile`: dedicated statistics, achievements and account management.
- `/scan`: camera-first UI using the existing `html5-qrcode` reader and `gf_record_recycling` RPC.
- `/admin`: compatible visual styling; admin categories, bins, QR printing and branding management retained.
- `/auth`, `/onboarding`, and `/`: adjusted to welcome members beyond the initial UNIBEN pilot, while still accurately describing UNIBEN as the first pilot.

## Local setup

```sh
npm install
npm run build
npm run dev
```

Preserve `.env.local` from your existing local configuration. The frontend requires your working Supabase public URL and anon key. Do not put Resend secret keys in client-side environment variables.

## Database and email

All prior migrations are still inside `supabase/migrations`, including the admin-branding migration. **No new SQL migration is needed solely for this visual pass.** Do not re-run previously completed migrations without checking their effects. The Resend Edge Function remains at `supabase/functions/send-email/index.ts`; integrating automated notifications into app events is separate from styling.

The dashboard's monthly progress target currently defaults to **30 eligible recycling actions** (`MONTHLY_GOAL` in `app/account/page.tsx`); this is a UI participation goal, not independently measured waste diversion. The Green Score ring shows progress toward the next score milestone, while the number remains the actual lifetime score.

## Verification

Application TypeScript/TSX source was parsed for syntax errors. Visual CSS was smoke-tested in an isolated HTML preview at 393px, 768px, and 1024px widths for basic layout and overflow. The isolated preview is **not** a live Next.js/Supabase integration test. Full `npm install` and production build could not be completed in the packaging environment because the npm registry request failed (`EAI_AGAIN`). Run the build locally before deployment.

Pilot checklist: sign-in/sign-up, onboarding, branding upload/fallback, print bin QR, mobile camera permissions on HTTPS, score award/cooldown, purchase credits, leaderboard, and small-screen navigation.
