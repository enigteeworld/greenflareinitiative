# GreenFlare — approved mobile design, rankings & Learn

This is a full-source update based on `GreenFlare_2_Approved_Reference_Mobile_Implementation.zip`.

## What changed
- Replaced the generic Rankings layout with the approved three-person podium, an easy-to-read list, and a separate community view.
- People/Communities segmented selector and honest Week/Month/All-time selection.
- A new `/learn` destination, searchable educational guide categories and six real guide pages (`/learn/[slug]`). Learn is linked from Profile, **not** added to the 4-item bottom navigation.
- Profile redesigned with a large uploaded avatar, live stats, achievements link, and clear section rows.
- `My Green World` receives an illustrated play space, separate Store tab and richer styling. Purchases continue through the existing RPC.
- A compact frosted brand, bell and avatar header is **hidden at page top** and appears only once the window has scrolled >100px; the ordinary top header scrolls away naturally. The existing navigation remains Home / Rankings / My World / Profile.

## Supabase migration
Run `supabase/migrations/20261008_greenflare_period_rankings.sql` **after** earlier migrations (including `20261008_greenflare_notifications_and_avatars.sql`). This adds a read-only, authenticated, minimal-field rankings function `gf_public_rankings`.

Until the migration is applied, the app falls back to the existing lifetime `gf_leaderboard` function and disables Week/Month filters rather than presenting inaccurate period data. Group/community rankings use average score **per participating member** to limit the advantage of larger communities.

## Local testing
Preserve your existing `.env.local` before replacing files.

```bash
npm install
npm run build
npm run dev
```

Check with mobile viewport sizes around 375px, 393px, 430px, and a desktop viewport. Verify normal header at top; scroll down at least 100px to reveal frosted header and scroll back to hide. Confirm the bell points to `/notifications`; check `/learn`, individual guides, Rankings tabs, profile avatar, and garden. Confirm registration, QR scanning and score allocation with your Supabase project.

## Caveats
- Your database must have the avatar/notification migration applied for full profile and notification functionality.
- Rankings are based on recorded eligible actions, not audited recycling weight.
- No unrelated finance/blockchain flows have been re-enabled.
