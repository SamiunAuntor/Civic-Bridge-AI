begin;

alter table public.cases
  add column if not exists initial_stability_score numeric(5,2) null;

with first_case_assessment as (
  select distinct on (a.case_id)
    a.case_id,
    a.stability_score
  from public.assessments a
  where a.case_id is not null
  order by a.case_id, a.created_at asc, a.id asc
)
update public.cases c
set initial_stability_score = fca.stability_score
from first_case_assessment fca
where c.id = fca.case_id
  and c.initial_stability_score is null;

commit;
