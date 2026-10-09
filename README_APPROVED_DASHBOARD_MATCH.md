# GreenFlare — approved mobile dashboard and unified UI

This package is based on `GreenFlare_2_Approved_Light_Mobile_First_Full_Update.zip` and implements the approved warm-ivory reference more closely.

## Core layout
- Warm ivory background and white cards, with forest text, azure recycling progress, amber weekly status, and the circular non-leaf GreenFlare symbol.
- Dashboard focuses on Green Score, monthly recycling progress, weekly activity and the main Scan action. Live Supabase values replace mockup figures.
- Mobile bottom navigation **keeps the existing destinations**: Home (`/account`), Rankings (`/leaderboard`), My World (`/garden`), Profile (`/profile`). It is styled as the reference's bottom dock. Scan remains a prominent in-dashboard CTA and a desktop menu item.
- Header includes a **functional** notifications bell linking to `/notifications`. It shows a badge when unread records exist. Notification records originate from `gf_notifications`; this release does NOT invent notifications or claim automated sending is configured.
- Circular member avatar shows the user's photo when uploaded or a polished silhouette fallback. Profile lets members upload a 2 MB PNG/JPEG/WebP photo after applying the optional SQL migration.
- Separate `/activity` page handles detailed weekly chart and history, keeping the dashboard simple.
- Rankings, My World, Profile, Scanner and Admin use the same colors, typography, shapes and spacing.
- Existing admin logo, favicon, preloader uploads remain. The bounce animation and renewal-mark fallback remain.

## Installation
Keep your private `.env.local` when replacing the source directory. Then:

```bash
npm install
npm run build
npm run dev
```

### SQL — only for these new features
If the pilot, category, profile compatibility and admin branding migrations are already applied, run only:

`supabase/migrations/20261008_greenflare_notifications_and_avatars.sql`

This migration adds an optional `profiles.avatar_url` field, a public avatar bucket with per-user upload rules, and permissions for users to mark their own notifications read. It does **not** modify scoring, bin records, garden balances or historic recycling data. Always back up the database before applying migrations.

No new npm dependencies were added for this visual pass.

## Testing notes
- Test `/account` at 320, 375, 393, 430 and 768 px wide.
- Test clicking the bell (should navigate to `/notifications`) and the four established bottom nav links.
- Check a first-time account (zero score/actions), a participant with score and actions, and loss-of-network error states.
- Verify avatar upload in Supabase Storage after applying the new migration. The app can still render old profiles while the optional column is absent.
- Validate the scanner on physical Android Chrome and iPhone Safari using HTTPS, and run `npm run build` locally before production deployment.
- The website cannot infer actual physical waste weight from a QR scan; counts represent eligible recorded actions.

