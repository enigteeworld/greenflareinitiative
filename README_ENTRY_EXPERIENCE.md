# GreenFlare app-first entry experience

This release follows the approved warm-ivory mobile visual system.

## User-facing changes

- `/`: Two-step welcome introduction. Slide 1 uses the included recycling-bin photograph; slide 2 uses the included community photograph. Continue leads to `/auth`; Skip opens `/auth`; Create account opens `/auth?mode=signup`.
- Returning users with an existing Supabase session automatically go to `/account` instead of the welcome screens.
- `/auth`: Refreshed login/signup presentation. Supabase login, signup, email verification and onboarding routing stay intact.
- `/reset-password`: Handles links requested through the Forgot password action. Configure the URL as allowed in Supabase Auth URL Configuration for reset emails to work.
- App-wide bottom nav on mobile: Home / Rankings / **Scan** / My World / Profile; Scan is a raised circular green button. Small hover/press/glint effects respect the reduced-motion preference.
- Desktop keeps existing nav and Scan link.
- The existing scroll-triggered glassmorphic header remains unchanged.
- `app/gf-entry.css`: Entry and navigation styles. Imported after the existing design styles.

## Supabase

No new SQL migration is needed for the entry design. Reuse existing `.env.local` and previously-applied database migrations.

For password reset emails, configure the Supabase Auth redirect URL `https://YOUR-DEPLOYED-DOMAIN/reset-password` and the matching local URL (e.g. `http://localhost:3000/reset-password`) in **Authentication > URL Configuration**.

## Install and test

1. Keep a backup of `.env.local`, then replace the previous project with this ZIP.
2. `npm install`
3. `npm run build`
4. `npm run dev`
5. Test `/`, `/auth`, `/auth?mode=signup`, `/account`, `/scan`, and the password reset flow on iOS Safari and Android Chrome.

### Verification caveat

The source and stylesheet passed parser checks, and the archive was verified. A full production build and live mobile browser rendering were **not** completed in the packaging environment because npm packages were not locally cached. Run the build locally before deployment.
