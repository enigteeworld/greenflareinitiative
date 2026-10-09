-- GreenFlare mobile reference update: member avatars and notification read state.
-- Run once AFTER pilot and profile-compatibility migrations. Safe to rerun.
-- Does not touch wallet, QR, bin, or scoring records.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;
GRANT UPDATE (avatar_url) ON public.profiles TO authenticated;

-- Preserve legacy id/auth_user_id compatibility for member-owned updates.
DROP POLICY IF EXISTS gf_profile_update ON public.profiles;
CREATE POLICY gf_profile_update ON public.profiles
FOR UPDATE TO authenticated
USING (id = auth.uid() OR auth_user_id = auth.uid())
WITH CHECK (id = auth.uid() OR auth_user_id = auth.uid());

-- A member can mark their own notifications read, not edit notification content.
DROP POLICY IF EXISTS gf_notifications_mark_read ON public.gf_notifications;
CREATE POLICY gf_notifications_mark_read ON public.gf_notifications
FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
GRANT SELECT ON public.gf_notifications TO authenticated;
GRANT UPDATE (read_at) ON public.gf_notifications TO authenticated;

INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
VALUES('gf_avatars','gf_avatars',true,2097152,ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS gf_avatar_public_read ON storage.objects;
CREATE POLICY gf_avatar_public_read ON storage.objects FOR SELECT
TO public USING(bucket_id = 'gf_avatars');
DROP POLICY IF EXISTS gf_avatar_owner_upload ON storage.objects;
CREATE POLICY gf_avatar_owner_upload ON storage.objects FOR INSERT
TO authenticated WITH CHECK(
  bucket_id = 'gf_avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
DROP POLICY IF EXISTS gf_avatar_owner_delete ON storage.objects;
CREATE POLICY gf_avatar_owner_delete ON storage.objects FOR DELETE
TO authenticated USING(
  bucket_id = 'gf_avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
