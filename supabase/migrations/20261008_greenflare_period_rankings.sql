-- GreenFlare: secure period rankings for the approved mobile leaderboards.
-- Apply after the existing pilot, compatibility, categories and avatar migrations.
-- This exposes only opted-in/participating public leaderboard information.
-- It does not grant students access to other users' raw recycling records.
BEGIN;
CREATE OR REPLACE FUNCTION public.gf_public_rankings(p_period TEXT DEFAULT 'all')
RETURNS TABLE(id UUID, username TEXT, hostel TEXT, score BIGINT, avatar_url TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
DECLARE v_start TIMESTAMPTZ;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
 IF p_period NOT IN ('all','month','week') OR p_period IS NULL THEN
   RAISE EXCEPTION 'Unsupported ranking period';
 END IF;
 IF p_period = 'week' THEN
   v_start := date_trunc('week', now() AT TIME ZONE 'Africa/Lagos') AT TIME ZONE 'Africa/Lagos';
 ELSIF p_period = 'month' THEN
   v_start := date_trunc('month', now() AT TIME ZONE 'Africa/Lagos') AT TIME ZONE 'Africa/Lagos';
 END IF;
 RETURN QUERY
 SELECT COALESCE(p.auth_user_id,p.id) AS id,
        COALESCE(NULLIF(p.username,''),'GreenFlare member')::TEXT AS username,
        p.hostel::TEXT,
        CASE WHEN p_period = 'all' THEN COALESCE(w.lifetime_points,0)::BIGINT
             ELSE COALESCE(a.total,0)::BIGINT END AS score,
        p.avatar_url::TEXT
 FROM public.profiles p
 LEFT JOIN public.gf_wallets w ON w.user_id=COALESCE(p.auth_user_id,p.id)
 LEFT JOIN LATERAL (
    SELECT SUM(g.points)::BIGINT AS total FROM public.gf_actions g
    WHERE g.user_id=COALESCE(p.auth_user_id,p.id)
      AND g.created_at>=v_start
 ) a ON p_period <> 'all'
 WHERE p.onboarding_completed IS TRUE
 ORDER BY 4 DESC, 2 ASC
 LIMIT 1000;
END;
$$;
REVOKE ALL ON FUNCTION public.gf_public_rankings(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.gf_public_rankings(TEXT) TO authenticated;
COMMIT;
