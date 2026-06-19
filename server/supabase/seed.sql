-- Optional seed data for the CivicBridgeAI backend.
-- Safe fictional sample resources for a fresh database.
--
-- Assumption: the backend only requires the exact columns currently described
-- by the README and selected by resource.repository.js.

insert into public.resources (
  name,
  description,
  category,
  eligibility,
  contact
)
values
  (
    'Emergency Rental Stabilization Program',
    'Short-term rental support for households facing immediate eviction risk, including intake guidance and documentation checklists.',
    'Housing',
    'For residents facing a documented rent crisis or active eviction notice.',
    'Call 555-0101 or visit https://example.org/rental-support'
  ),
  (
    'Community Benefits Enrollment Clinic',
    'Navigation help for unemployment benefits, SNAP, and other income support programs with one-on-one application assistance.',
    'Income Support',
    'Open to adults experiencing sudden job loss, income disruption, or delayed public benefits.',
    'Email benefits@example.org or call 555-0102'
  ),
  (
    'Urgent Care Access Network',
    'Referral program connecting uninsured or underinsured clients to low-cost clinics, medication assistance, and same-week appointments.',
    'Healthcare',
    'For individuals with healthcare access barriers, medication interruption, or urgent non-emergency medical needs.',
    'Visit https://example.org/care-access or call 555-0103'
  ),
  (
    'Family Crisis Navigation Line',
    'A coordinated support line offering triage, local nonprofit referrals, and follow-up planning for overlapping housing, food, and safety concerns.',
    'Crisis Navigation',
    'Available to households facing multiple simultaneous hardship factors.',
    'Call 555-0104 any weekday from 8am to 6pm'
  ),
  (
    'Neighborhood Food Security Partnership',
    'Local pantry and meal coordination resource with information on recurring pickup windows, emergency boxes, and family nutrition support.',
    'Food Assistance',
    'For households with immediate food insecurity or disrupted grocery access.',
    'Text FOOD to 555-0105 or visit https://example.org/food-partnership'
  );
