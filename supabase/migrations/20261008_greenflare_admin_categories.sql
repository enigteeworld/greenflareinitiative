-- Run AFTER 20261008_greenflare_pilot.sql. Safe to re-run.
-- Admin-managed material categories, including general waste and tin.
create table if not exists public.gf_material_categories (
  slug text primary key,
  name text not null unique,
  description text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint gf_material_slug_format check (slug ~ '^[a-z][a-z0-9_]{1,39}$'),
  constraint gf_material_name_length check (char_length(trim(name)) between 2 and 70)
);
insert into public.gf_material_categories(slug,name) values
 ('plastic','Plastic'),('sachet','Sachet Waste'),('paper','Paper'),('metal','Metal / Tin'),('glass','Glass'),('general_waste','General Waste')
on conflict (slug) do nothing;
-- Ensure any pre-existing categories in bin records are retained.
insert into public.gf_material_categories(slug,name)
select distinct material, initcap(replace(material,'_',' ')) from public.gf_bins
where material ~ '^[a-z][a-z0-9_]{1,39}$'
and not exists(select 1 from public.gf_material_categories c where c.slug=gf_bins.material)
on conflict do nothing;
-- Remove the original fixed-list material check, retaining other bin constraints.
do $$ declare r record; begin
  for r in select conname from pg_constraint
    where conrelid='public.gf_bins'::regclass and contype='c'
      and pg_get_constraintdef(oid) ilike '%material%'
  loop execute format('alter table public.gf_bins drop constraint %I', r.conname); end loop;
end $$;
do $$ begin
 if not exists(select 1 from pg_constraint where conrelid='public.gf_bins'::regclass and conname='gf_bins_material_category_fk') then
   alter table public.gf_bins add constraint gf_bins_material_category_fk foreign key(material)
   references public.gf_material_categories(slug) on update restrict on delete restrict;
 end if;
end $$;
create index if not exists gf_bins_material_idx on public.gf_bins(material);
alter table public.gf_material_categories enable row level security;
drop policy if exists gf_material_categories_read on public.gf_material_categories;
create policy gf_material_categories_read on public.gf_material_categories for select to authenticated using(active);
revoke insert,update,delete on public.gf_material_categories from anon,authenticated;
-- Only the authenticated admin API using a service-role client can modify categories.
