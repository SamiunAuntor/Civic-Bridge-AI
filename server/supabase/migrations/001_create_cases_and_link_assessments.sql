-- Phase 1: create durable cases and link existing assessments.
-- Additive only. Do not execute against production without backup and review.
-- Verification after execution:
-- select count(*) from public.assessments where case_id is null;
-- select count(*) from public.cases;
-- select count(*) from public.assessments;

begin;

create table if not exists public.cases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  summary text null,
  status text not null default 'ACTIVE',
  main_risk text null,
  initial_stability_score numeric(5,2) null,
  latest_stability_score numeric(5,2) null,
  current_assessment_id uuid null,
  last_activity_at timestamptz not null default now(),
  archived_at timestamptz null,
  resolved_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cases_status_check
    check (status in ('ACTIVE', 'URGENT', 'STABLE', 'RESOLVED', 'ARCHIVED'))
);

alter table public.assessments
  add column if not exists case_id uuid null,
  add column if not exists assessment_kind text not null default 'INITIAL',
  add column if not exists change_note text null;

create index if not exists idx_cases_user_id on public.cases(user_id);
create index if not exists idx_cases_user_status on public.cases(user_id, status);
create index if not exists idx_cases_user_updated_at on public.cases(user_id, updated_at desc);
create index if not exists idx_assessments_case_id on public.assessments(case_id);

insert into public.cases (
  user_id,
  title,
  summary,
  status,
  main_risk,
  initial_stability_score,
  latest_stability_score,
  current_assessment_id,
  last_activity_at,
  created_at,
  updated_at
)
select
  a.user_id,
  coalesce(
    nullif(left(regexp_replace(trim(a.situation_text), '\s+', ' ', 'g'), 80), ''),
    'Crisis case ' || a.id::text
  ) as title,
  nullif(left(regexp_replace(trim(a.situation_text), '\s+', ' ', 'g'), 240), '') as summary,
  case
    when ra.overall_risk = 'HIGH' then 'URGENT'
    when ra.overall_risk = 'LOW' then 'STABLE'
    else 'ACTIVE'
  end as status,
  ra.overall_risk,
  a.stability_score,
  a.stability_score,
  a.id,
  coalesce(a.updated_at, a.created_at, now()),
  coalesce(a.created_at, now()),
  coalesce(a.updated_at, a.created_at, now())
from public.assessments a
left join public.risk_assessments ra
  on ra.assessment_id = a.id
left join public.cases c
  on c.current_assessment_id = a.id
where a.case_id is null
  and c.id is null;

update public.assessments a
set case_id = c.id
from public.cases c
where a.case_id is null
  and c.current_assessment_id = a.id;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'assessments_case_id_fkey'
  ) then
    alter table public.assessments
      add constraint assessments_case_id_fkey
      foreign key (case_id) references public.cases(id) on delete cascade;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'cases_current_assessment_id_fkey'
  ) then
    alter table public.cases
      add constraint cases_current_assessment_id_fkey
      foreign key (current_assessment_id) references public.assessments(id) on delete set null;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'set_cases_updated_at'
  ) then
    create trigger set_cases_updated_at
    before update on public.cases
    for each row
    execute function public.set_updated_at();
  end if;
end $$;

commit;
