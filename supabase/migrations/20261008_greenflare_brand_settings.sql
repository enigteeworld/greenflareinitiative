-- Run after the core GreenFlare migrations. Safe to rerun.
CREATE TABLE IF NOT EXISTS public.gf_brand_settings (
 id BOOLEAN PRIMARY KEY DEFAULT TRUE CHECK (id = TRUE),
 logo_url TEXT,
 favicon_url TEXT,
 preloader_url TEXT,
 updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO public.gf_brand_settings(id) VALUES(TRUE) ON CONFLICT (id) DO NOTHING;
ALTER TABLE public.gf_brand_settings ENABLE ROW LEVEL SECURITY;
-- No client-side writes. Public reads can use the server endpoint; service-role writes are admin-verified.
REVOKE ALL ON public.gf_brand_settings FROM anon,authenticated;
INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 VALUES('gf-branding','gf-branding',true,2097152,ARRAY['image/png','image/jpeg','image/webp','image/gif'])
 ON CONFLICT(id) DO UPDATE SET public=true,file_size_limit=2097152,allowed_mime_types=EXCLUDED.allowed_mime_types;
-- Public read only; uploads and changes exclusively through the authenticated admin API.
DROP POLICY IF EXISTS gf_branding_public_read ON storage.objects;
CREATE POLICY gf_branding_public_read ON storage.objects FOR SELECT TO public USING (bucket_id='gf-branding');
