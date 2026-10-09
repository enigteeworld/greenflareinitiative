-- Run after the pilot and admin categories migrations.
-- Safely supports legacy profiles whose id is not the Supabase Auth user ID.
-- Do not delete or rewrite original profile IDs.
BEGIN;
DROP POLICY IF EXISTS gf_profile_read ON public.profiles;
CREATE POLICY gf_profile_read ON public.profiles FOR SELECT TO authenticated
USING (id = (select auth.uid()) OR auth_user_id = (select auth.uid()));
DROP POLICY IF EXISTS gf_profile_update ON public.profiles;
CREATE POLICY gf_profile_update ON public.profiles FOR UPDATE TO authenticated
USING (id = (select auth.uid()) OR auth_user_id = (select auth.uid()))
WITH CHECK (id = (select auth.uid()) OR auth_user_id = (select auth.uid()));
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (username,hostel,campus,onboarding_completed) ON public.profiles TO authenticated;
CREATE OR REPLACE FUNCTION public.gf_leaderboard()
RETURNS TABLE(id uuid,username text,hostel text,score bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
SELECT COALESCE(p.auth_user_id,p.id),p.username,p.hostel,COALESCE(w.lifetime_points,0)
FROM public.profiles p
LEFT JOIN public.gf_wallets w ON w.user_id = COALESCE(p.auth_user_id,p.id)
WHERE p.onboarding_completed = true
ORDER BY COALESCE(w.lifetime_points,0) DESC LIMIT 1000;
$$;
REVOKE ALL ON FUNCTION public.gf_leaderboard() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.gf_leaderboard() TO authenticated;
CREATE OR REPLACE FUNCTION public.gf_record_recycling(p_code text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_user uuid:=auth.uid();v_bin public.gf_bins%rowtype;v_count integer;v_last timestamptz;v_balance bigint;v_total bigint;
BEGIN
 IF v_user IS NULL THEN RAISE EXCEPTION 'Sign in to record recycling'; END IF;
 IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE (auth_user_id=v_user OR id=v_user) AND onboarding_completed=true) THEN RAISE EXCEPTION 'Complete your student profile first'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(v_user::text,2026));
 SELECT * INTO v_bin FROM public.gf_bins WHERE code=upper(trim(p_code)) AND active=true;
 IF NOT FOUND THEN RAISE EXCEPTION 'This bin is not registered or is inactive'; END IF;
 SELECT max(created_at),count(*) FILTER(WHERE created_at>=date_trunc('day',now() at time zone 'Africa/Lagos') at time zone 'Africa/Lagos') INTO v_last,v_count FROM public.gf_actions WHERE user_id=v_user;
 IF v_last IS NOT NULL AND v_last>now()-interval '10 minutes' THEN RAISE EXCEPTION 'Please wait 10 minutes between rewarded actions'; END IF;
 IF v_count>=12 THEN RAISE EXCEPTION 'Daily limit of 12 rewarded scans reached'; END IF;
 INSERT INTO public.gf_actions(user_id,bin_id,points) VALUES(v_user,v_bin.id,v_bin.points);
 INSERT INTO public.gf_wallets(user_id,lifetime_points,credits,updated_at) VALUES(v_user,v_bin.points,v_bin.points,now())
 ON CONFLICT(user_id) DO UPDATE SET lifetime_points=public.gf_wallets.lifetime_points+excluded.lifetime_points,credits=public.gf_wallets.credits+excluded.credits,updated_at=now()
 RETURNING credits,lifetime_points INTO v_balance,v_total;
 RETURN jsonb_build_object('ok',true,'earned',v_bin.points,'credits',v_balance,'lifetime_points',v_total,'bin',v_bin.name,'material',v_bin.material);
END $$;
REVOKE ALL ON FUNCTION public.gf_record_recycling(text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.gf_record_recycling(text) TO authenticated;
COMMIT;
