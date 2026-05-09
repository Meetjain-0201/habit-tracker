-- USER PROFILE
create table if not exists user_profile (
  id uuid default gen_random_uuid() primary key,
  name text default 'Meet',
  weight_kg numeric default 56,
  target_weight_kg numeric default 60,
  current_tier integer default 1,
  created_at timestamp default now()
);

-- DAILY LOGS (one row per day)
create table if not exists daily_logs (
  id uuid default gen_random_uuid() primary key,
  log_date date not null unique,
  wake_time time,
  sleep_time time,
  gym_done boolean default false,
  gym_quality integer check (gym_quality between 1 and 10),
  sauna_done boolean default false,
  skin_morning_done boolean default false,
  skin_evening_done boolean default false,
  hair_oil_done boolean default false,
  b12_done boolean default false,
  calcium_morning_done boolean default false,
  calcium_evening_done boolean default false,
  protein_shake_done boolean default false,
  fruit_done boolean default false,
  breakfast_done boolean default false,
  lunch_done boolean default false,
  dinner_done boolean default false,
  water_glasses integer default 0,
  cold_outreach_done boolean default false,
  job_applications_count integer default 0,
  work_prep_done boolean default false,
  notes text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- WEEKLY SUMMARY (auto calculated)
create table if not exists weekly_summary (
  id uuid default gen_random_uuid() primary key,
  week_start date not null unique,
  gym_days integer default 0,
  gym_status text,
  avg_water numeric,
  total_applications integer default 0,
  total_outreach integer default 0,
  tier_recommendation integer,
  notes text,
  created_at timestamp default now()
);

-- WEIGHT LOG
create table if not exists weight_log (
  id uuid default gen_random_uuid() primary key,
  log_date date not null,
  weight_kg numeric not null,
  created_at timestamp default now()
);

-- ROW LEVEL SECURITY
-- Single user personal app, the anon key is the app's only client.
-- Permissive policies are intentional. Do not copy this pattern for multi user apps.
alter table user_profile enable row level security;
alter table daily_logs enable row level security;
alter table weekly_summary enable row level security;
alter table weight_log enable row level security;

drop policy if exists "anon_all_user_profile" on user_profile;
drop policy if exists "anon_all_daily_logs" on daily_logs;
drop policy if exists "anon_all_weekly_summary" on weekly_summary;
drop policy if exists "anon_all_weight_log" on weight_log;

create policy "anon_all_user_profile"
  on user_profile for all to anon using (true) with check (true);
create policy "anon_all_daily_logs"
  on daily_logs for all to anon using (true) with check (true);
create policy "anon_all_weekly_summary"
  on weekly_summary for all to anon using (true) with check (true);
create policy "anon_all_weight_log"
  on weight_log for all to anon using (true) with check (true);
