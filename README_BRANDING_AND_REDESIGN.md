# GreenFlare design and branding pass

## New design
- Page-specific editorial theme for rankings, personal profile, garden, admin surfaces, forms, dark typography and small screens.
- Consistent mint, amber, lavender and sky secondary colors on deep graphite/forest surfaces.
- Logo fallback mark is designed with 3 colored vertical bars (not a leaf emoji).
- Preloader has a bouncing icon or uploaded image, accessible reduced-motion behavior and automatic CSS fade.

## Admin branding setup
1. Back up your Supabase database before applying migrations.
2. Execute `supabase/migrations/20261008_greenflare_brand_settings.sql` in Supabase SQL Editor **after** the pilot and categories migrations.
3. Ensure your Next.js server has `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` set; keep service role secret exclusively server-side.
4. Sign in to a user already listed in `gf_admins`. Open `/admin` and use **Visual identity / Settings**.
5. Upload a logo, PNG favicon, and preloader image independently. Each has a Use fallback button.
6. Accepted images: PNG/JPEG/WebP/GIF up to 2 MB. Favicon: PNG only. SVG uploads are disallowed.

New endpoints:
- `GET /api/branding` retrieves current published assets, with built-in defaults if not yet configured.
- `POST /api/pilot-admin/branding` requires admin bearer authorization; validates uploads and stores images in public `gf-branding` bucket.

The preloader's CSS animation is intentionally short and is **not** a data-loading gate. Uploaded graphics may take an additional initial network request before they appear, and the branded fallback is displayed in that case.

## Local install
`npm install && npm run build`

Restart `npm run dev` after updating files. No extra npm packages were added for branding/preloader.

## Verification
Project files were packaged and source reviewed, but a full Next.js build and browser-based visual check are still required on your machine. Test site navigation, upload/reload/delete assets and iOS + Android appearance before deployment.
