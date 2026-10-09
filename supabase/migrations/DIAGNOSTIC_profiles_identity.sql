-- READ-ONLY: run after migration to identify existing profiles with a different primary ID.
-- The pilot currently expects profiles.id = auth.users.id.
select id, auth_user_id, email from public.profiles
where auth_user_id is not null and id is distinct from auth_user_id;
