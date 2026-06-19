-- CivicBridgeAI backend schema
-- Safe to run once on a fresh Supabase PostgreSQL database.
--
-- Assumptions documented inline are based on repository code inspection.
-- This file is intentionally conservative: it creates only the tables and
-- columns the current backend code and README clearly reference.
--
-- Important limitation:
-- The current backend has at least one runtime bug that SQL alone cannot fix:
-- `server/src/services/assessment.service.js` calls `savePriorities(data.id, ...)`
-- even though `data` is undefined there. This schema is aligned to the table
-- contract the code expects, but it cannot compensate for that JavaScript bug.

-- Supabase Postgres projects normally expose `gen_random_uuid()` already.
-- If your environment does not, enable `pgcrypto` manually before running this
-- file. The executable `create extension` statement is omitted here because
-- some SQL tooling/parsers used alongside Supabase reject it in schema files.

-- Shared timestamp trigger used for tables that include updated_at.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  firebase_uid text not null unique,
  email text,
  name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  situation_text text not null,
  -- Using numeric instead of integer because the AI prompt contract says
  -- "number" and the backend does not validate integer-only output.
  stability_score numeric(5,2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint assessments_stability_score_check
    check (stability_score >= 0 and stability_score <= 100)
);

create table if not exists public.risk_assessments (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null unique
    references public.assessments(id) on delete cascade,
  housing_risk text not null,
  income_risk text not null,
  healthcare_risk text not null,
  overall_risk text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint risk_assessments_housing_risk_check
    check (housing_risk in ('LOW', 'MEDIUM', 'HIGH')),
  constraint risk_assessments_income_risk_check
    check (income_risk in ('LOW', 'MEDIUM', 'HIGH')),
  constraint risk_assessments_healthcare_risk_check
    check (healthcare_risk in ('LOW', 'MEDIUM', 'HIGH')),
  constraint risk_assessments_overall_risk_check
    check (overall_risk in ('LOW', 'MEDIUM', 'HIGH'))
);

create table if not exists public.priorities (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  priority_order integer not null,
  title text not null,
  reasoning text not null,
  -- Using numeric for the same reason as stability_score: the backend accepts
  -- AI-generated numbers and does not enforce integer-only values.
  confidence_score numeric(5,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint priorities_confidence_score_check
    check (confidence_score is null or (confidence_score >= 0 and confidence_score <= 100)),
  -- Assumption: one priority rank should only appear once per assessment.
  constraint priorities_assessment_id_priority_order_key
    unique (assessment_id, priority_order)
);

create table if not exists public.roadmaps (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  timeline text not null,
  task text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.simulations (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  decision text not null,
  housing_impact text not null,
  income_impact text not null,
  health_impact text not null,
  summary text not null,
  recommended_action text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint simulations_housing_impact_check
    check (housing_impact in ('LOW', 'MEDIUM', 'HIGH')),
  constraint simulations_income_impact_check
    check (income_impact in ('LOW', 'MEDIUM', 'HIGH')),
  constraint simulations_health_impact_check
    check (health_impact in ('LOW', 'MEDIUM', 'HIGH'))
);

create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  category text,
  eligibility text,
  contact text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
  -- Assumption: no unique constraint on name because the current backend does
  -- not enforce uniqueness and multiple similarly named resources may exist.
);

create index if not exists idx_assessments_user_id
  on public.assessments(user_id);

create index if not exists idx_risk_assessments_assessment_id
  on public.risk_assessments(assessment_id);

create index if not exists idx_priorities_assessment_id
  on public.priorities(assessment_id);

create index if not exists idx_priorities_assessment_order
  on public.priorities(assessment_id, priority_order);

create index if not exists idx_roadmaps_assessment_id
  on public.roadmaps(assessment_id);

create index if not exists idx_simulations_assessment_id
  on public.simulations(assessment_id);

create trigger set_users_updated_at
before update on public.users
for each row
execute function public.set_updated_at();

create trigger set_assessments_updated_at
before update on public.assessments
for each row
execute function public.set_updated_at();

create trigger set_risk_assessments_updated_at
before update on public.risk_assessments
for each row
execute function public.set_updated_at();

create trigger set_priorities_updated_at
before update on public.priorities
for each row
execute function public.set_updated_at();

create trigger set_roadmaps_updated_at
before update on public.roadmaps
for each row
execute function public.set_updated_at();

create trigger set_simulations_updated_at
before update on public.simulations
for each row
execute function public.set_updated_at();

create trigger set_resources_updated_at
before update on public.resources
for each row
execute function public.set_updated_at();
