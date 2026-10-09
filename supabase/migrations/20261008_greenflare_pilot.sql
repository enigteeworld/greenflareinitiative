-- GreenFlare pilot schema. Run in Supabase SQL editor after taking a backup.
create extension if not exists pgcrypto;
create table if not exists public.profiles (id uuid primary key references auth.users(id) on delete cascade, auth_user_id uuid unique references auth.users(id) on delete cascade, email text, full_name text, username text, campus text, hostel text, phone text, role text default 'participant', trust_score integer default 0, onboarding_completed boolean not null default false);
alter table public.profiles add column if not exists id uuid;
alter table public.profiles add column if not exists auth_user_id uuid;
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists username text;
alter table public.profiles add column if not exists campus text;
alter table public.profiles add column if not exists hostel text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists role text default 'participant';
alter table public.profiles add column if not exists trust_score integer default 0;
alter table public.profiles add column if not exists onboarding_completed boolean default false;
create unique index if not exists profiles_auth_uid_idx on public.profiles(auth_user_id);
create or replace function public.gf_auth_profile() returns trigger language plpgsql security definer set search_path = '' as $$
begin
 insert into public.profiles(id,auth_user_id,email,full_name,onboarding_completed)
 values(new.id,new.id,new.email,coalesce(new.raw_user_meta_data->>'full_name',''),false)
 on conflict do nothing; -- Never overwrite an existing profile or collide with auth_user_id.
 return new;
end $$;
drop trigger if exists gf_auth_profile_insert on auth.users;
create trigger gf_auth_profile_insert after insert on auth.users for each row execute function public.gf_auth_profile();
-- Existing installations may have profiles.id distinct from profiles.auth_user_id.
-- Only insert missing auth-user profiles; preserve rows already tied to each auth user.
insert into public.profiles(id,auth_user_id,email,full_name)
select u.id,u.id,u.email,coalesce(u.raw_user_meta_data->>'full_name','')
from auth.users u
where not exists (select 1 from public.profiles p where p.auth_user_id=u.id or p.id=u.id)
on conflict do nothing;
create table if not exists public.gf_admins(user_id uuid primary key references auth.users(id) on delete cascade, created_at timestamptz default now());
create table if not exists public.gf_bins (id uuid primary key default gen_random_uuid(), code text unique not null, name text not null, campus text not null default 'University of Benin', hostel text not null, material text not null check(material in ('plastic','sachet','paper','metal','glass')), points integer not null default 10 check(points between 1 and 100), active boolean not null default true, created_at timestamptz not null default now());
create table if not exists public.gf_actions (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, bin_id uuid not null references public.gf_bins(id), points integer not null check(points>0), created_at timestamptz not null default now());
create index if not exists gf_actions_user_time on public.gf_actions(user_id,created_at desc);
create index if not exists gf_actions_bin_time on public.gf_actions(bin_id,created_at desc);
create table if not exists public.gf_wallets(user_id uuid primary key references auth.users(id) on delete cascade, lifetime_points bigint not null default 0 check(lifetime_points>=0), credits bigint not null default 0 check(credits>=0), updated_at timestamptz not null default now());
create table if not exists public.gf_items(id text primary key, name text not null, category text not null, price integer not null check(price>=0), icon text not null, active boolean not null default true);
insert into public.gf_items(id,name,category,price,icon) values ('seed','Starter plant','plants',50,'🌵'),('flower','Flower bed','plants',100,'🌼'),('tree','Shade tree','plants',200,'🌳'),('bucket','Watering can','tools',150,'🪣'),('path','Stone pathway','decor',250,'🪨'),('cottage','Eco cottage','buildings',1000,'🏠') on conflict (id) do nothing;
create table if not exists public.gf_garden(user_id uuid not null references auth.users(id) on delete cascade, slot integer not null check(slot between 0 and 11), item_id text not null references public.gf_items(id), created_at timestamptz not null default now(), primary key(user_id,slot));
create table if not exists public.gf_purchases(id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, item_id text not null references public.gf_items(id), cost integer not null, created_at timestamptz not null default now());
create index if not exists gf_purchases_user_time on public.gf_purchases(user_id,created_at desc);
create table if not exists public.gf_notifications(id uuid primary key default gen_random_uuid(),user_id uuid references auth.users(id) on delete cascade,kind text not null,subject text not null,body text not null,created_at timestamptz default now(),read_at timestamptz);
-- No client writes to financial/score/activity tables. Only authenticated RPC routines below mutate them.
alter table public.profiles enable row level security;
alter table public.gf_admins enable row level security;
alter table public.gf_bins enable row level security;
alter table public.gf_actions enable row level security;
alter table public.gf_wallets enable row level security;
alter table public.gf_items enable row level security;
alter table public.gf_garden enable row level security;
alter table public.gf_purchases enable row level security;
alter table public.gf_notifications enable row level security;
drop policy if exists gf_profile_read on public.profiles;
create policy gf_profile_read on public.profiles for select to authenticated using(true);
drop policy if exists gf_profile_update on public.profiles;
create policy gf_profile_update on public.profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid() and (auth_user_id is null or auth_user_id=auth.uid()));
drop policy if exists gf_bins_read on public.gf_bins;
create policy gf_bins_read on public.gf_bins for select to authenticated using(active);
drop policy if exists gf_my_actions on public.gf_actions;
create policy gf_my_actions on public.gf_actions for select to authenticated using(user_id=auth.uid());
drop policy if exists gf_wallet_read on public.gf_wallets;
create policy gf_wallet_read on public.gf_wallets for select to authenticated using(true);
drop policy if exists gf_items_read on public.gf_items;
create policy gf_items_read on public.gf_items for select to authenticated using(active);
drop policy if exists gf_garden_read on public.gf_garden;
create policy gf_garden_read on public.gf_garden for select to authenticated using(true);
drop policy if exists gf_purchases_read on public.gf_purchases;
create policy gf_purchases_read on public.gf_purchases for select to authenticated using(user_id=auth.uid());
drop policy if exists gf_notifications_read on public.gf_notifications;
create policy gf_notifications_read on public.gf_notifications for select to authenticated using(user_id=auth.uid());
-- Auth profiles are created via auth trigger: no general INSERT policy or direct score writes.
create or replace function public.gf_record_recycling(p_code text) returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_user uuid := auth.uid(); v_bin public.gf_bins%rowtype; v_count integer; v_last timestamptz; v_balance bigint; v_total bigint;
begin
 if v_user is null then raise exception 'Sign in to record recycling'; end if;
 if not exists(select 1 from public.profiles where id=v_user and onboarding_completed=true) then raise exception 'Complete your student profile first'; end if;
 -- Serialize all submissions from one user, including across bins, to enforce limits atomically.
 perform pg_advisory_xact_lock(hashtextextended(v_user::text, 2026));
 select * into v_bin from public.gf_bins where code=upper(trim(p_code)) and active=true;
 if not found then raise exception 'This bin is not registered or is inactive'; end if;
 select max(created_at),count(*) filter(where created_at >= date_trunc('day',now() at time zone 'Africa/Lagos') at time zone 'Africa/Lagos') into v_last,v_count from public.gf_actions where user_id=v_user;
 if v_last is not null and v_last>now()-interval '10 minutes' then raise exception 'Please wait 10 minutes between rewarded actions'; end if;
 if v_count>=12 then raise exception 'Daily limit of 12 rewarded scans reached'; end if;
 insert into public.gf_actions(user_id,bin_id,points) values(v_user,v_bin.id,v_bin.points);
 insert into public.gf_wallets(user_id,lifetime_points,credits,updated_at) values(v_user,v_bin.points,v_bin.points,now()) on conflict(user_id) do update set lifetime_points=public.gf_wallets.lifetime_points+excluded.lifetime_points,credits=public.gf_wallets.credits+excluded.credits,updated_at=now() returning credits,lifetime_points into v_balance,v_total;
 return jsonb_build_object('ok',true,'earned',v_bin.points,'credits',v_balance,'lifetime_points',v_total,'bin',v_bin.name,'material',v_bin.material);
end $$;
create or replace function public.gf_purchase_item(p_item text,p_slot integer) returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_user uuid:=auth.uid(); v_item public.gf_items%rowtype; v_balance bigint;
begin
 if v_user is null then raise exception 'Sign in first'; end if;
 if p_slot<0 or p_slot>11 then raise exception 'Invalid garden slot'; end if;
 perform pg_advisory_xact_lock(hashtextextended(v_user::text,2026));
 select * into v_item from public.gf_items where id=p_item and active=true;
 if not found then raise exception 'Item unavailable'; end if;
 if exists(select 1 from public.gf_garden where user_id=v_user and slot=p_slot) then raise exception 'Choose an empty garden spot'; end if;
 insert into public.gf_wallets(user_id) values(v_user) on conflict do nothing;
 update public.gf_wallets set credits=credits-v_item.price,updated_at=now() where user_id=v_user and credits>=v_item.price returning credits into v_balance;
 if not found then raise exception 'Not enough Green Credits'; end if;
 insert into public.gf_purchases(user_id,item_id,cost) values(v_user,p_item,v_item.price);
 insert into public.gf_garden(user_id,slot,item_id) values(v_user,p_slot,p_item);
 return jsonb_build_object('ok',true,'credits',v_balance);
end $$;
revoke all on function public.gf_record_recycling(text) from public,anon;
revoke all on function public.gf_purchase_item(text,integer) from public,anon;
grant execute on function public.gf_record_recycling(text) to authenticated;
grant execute on function public.gf_purchase_item(text,integer) to authenticated;
-- Explicitly revoke direct mutations, including for tables created with legacy grants.
revoke insert,update,delete on public.gf_wallets,public.gf_actions,public.gf_garden,public.gf_purchases,public.gf_bins,public.gf_items from anon,authenticated;
-- To appoint yourself, replace address with your verified Supabase Auth email:
-- insert into public.gf_admins(user_id) select id from auth.users where email='your-admin@example.com' on conflict do nothing;
-- Bin seed example (do not deploy a printed code until you register it):
-- insert into public.gf_bins(code,name,hostel,material) values ('GF-UNIBEN-OFO-PL-001','Ofo Plastic Bin 01','Ofo Hall','plastic');

-- Final privacy hardening: students can read only their own complete profiles.
drop policy if exists gf_profile_read on public.profiles;
create policy gf_profile_read on public.profiles for select to authenticated using(id=auth.uid());
revoke update on public.profiles from authenticated;
grant update(username,hostel,campus,onboarding_completed) on public.profiles to authenticated;
-- Public leaderboard exposes pseudonyms/hostels only, not personal emails or phones.
create or replace function public.gf_leaderboard() returns table(id uuid,username text,hostel text,score bigint) language sql stable security definer set search_path = '' as $$
 select p.id,p.username,p.hostel,coalesce(w.lifetime_points,0) from public.profiles p left join public.gf_wallets w on w.user_id=p.id where p.onboarding_completed=true order by coalesce(w.lifetime_points,0) desc limit 1000
$$;
revoke all on function public.gf_leaderboard() from public,anon;
grant execute on function public.gf_leaderboard() to authenticated;
