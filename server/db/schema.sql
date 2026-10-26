-- Peak U schema (PostgreSQL). Safe to read top to bottom.
create table users (
  id serial primary key,
  email text unique not null,
  password_hash text not null,
  name text not null,
  role text not null default 'student',
  degree text, year_of_study int,
  created_at timestamptz default now()
);
create table modules (id serial primary key, code text, name text not null);

-- Today's training and points
create table habit_templates (
  id serial primary key,
  category text not null check (category in ('study','health','money','team')),
  title text not null, points int not null
);
create table habit_logs (
  user_id int references users on delete cascade,
  habit_id int references habit_templates,
  day date not null,
  primary key (user_id, habit_id, day)
);
create table points_ledger (
  id serial primary key,
  user_id int references users on delete cascade,
  delta int not null, reason text, day date,
  created_at timestamptz default now()
);

-- Inputs for the form score
create table checkins (
  user_id int references users on delete cascade, day date,
  mood int check (mood between 1 and 5), stress int check (stress between 1 and 5),
  sleep_hours numeric, movement_minutes int,
  primary key (user_id, day)
);
create table attendance (
  user_id int references users on delete cascade, module_id int references modules, day date,
  attended boolean not null, primary key (user_id, module_id, day)
);
create table budgets (user_id int references users on delete cascade, month text, amount_cents int, primary key (user_id, month));
create table expenses (
  id serial primary key, user_id int references users on delete cascade,
  category text, amount_cents int not null, spent_on date not null
);

-- Season: tests, assignments, exams and benchmarks
create table assessments (
  id serial primary key, module_id int references modules,
  kind text check (kind in ('test','assignment','exam')),
  title text, weight numeric not null,   -- percent of the final mark
  due_on date, max_score numeric default 100
);
create table results (
  user_id int references users on delete cascade, assessment_id int references assessments,
  score numeric, primary key (user_id, assessment_id)
);
create table benchmarks (module_id int references modules, kind text, value numeric, primary key (module_id, kind));
create table personal_targets (user_id int references users on delete cascade, module_id int references modules, target numeric, primary key (user_id, module_id));

-- Captains (student mentors)
create table captains (
  user_id int primary key references users on delete cascade,
  year_of_study int check (year_of_study between 2 and 4),
  rate_cents int default 0, free_peer boolean default true,
  rating numeric default 0, weekly_cap int default 6, bio text
);
create table captain_modules (captain_id int references captains(user_id) on delete cascade, module_id int references modules, verified_grade numeric, primary key (captain_id, module_id));
create table captain_slots (id serial primary key, captain_id int references captains(user_id) on delete cascade, starts_at timestamptz not null, taken boolean default false);
create table bookings (
  id serial primary key, student_id int references users, captain_id int references captains(user_id),
  module_id int references modules, slot_id int references captain_slots,
  status text default 'confirmed', paid_with text default 'free', created_at timestamptz default now()
);

-- Study Lab history
create table problem_scans (id serial primary key, user_id int references users on delete cascade, kind text, topic text, result jsonb, created_at timestamptz default now());
