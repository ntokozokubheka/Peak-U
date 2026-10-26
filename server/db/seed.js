// Demo data. CUSTOMIZE: change modules, habits, marks, captains here.
import bcrypt from 'bcryptjs';

const ymd = (offset = 0) => {
  const d = new Date(); d.setDate(d.getDate() + offset);
  return d.toLocaleDateString('en-CA', { timeZone: process.env.APP_TZ || 'Africa/Johannesburg' });
};

export async function seed(db) {
  const q = (text, params) => db.query(text, params);
  const hash = await bcrypt.hash('demo1234', 10);

  const demo = (await q(`insert into users(email,password_hash,name,degree,year_of_study) values('demo@peaku.test',$1,'Demo Student','BSc Computer Science',1) returning id`, [hash])).rows[0].id;

  const mods = [];
  for (const [code, name] of [['MATH101', 'Mathematics 1'], ['COMP101', 'Programming 1'], ['PHYS101', 'Physics 1']]) {
    mods.push((await q('insert into modules(code,name) values($1,$2) returning id', [code, name])).rows[0].id);
  }

  // The 12 daily training items (same as the designs)
  const habits = [
    ['study', 'Warm-up: skim yesterday\'s notes and today\'s topics (10 min)', 10],
    ['study', 'Two focused study blocks, phone away', 30],
    ['study', 'Attend every class', 10],
    ['study', 'Scan and solve three problems in Study Lab', 20],
    ['study', 'Film review: one line on each mistake (15 min)', 10],
    ['health', 'Sleep 7.5 hours, screens off on time', 15],
    ['health', 'Move for 30 minutes', 15],
    ['health', 'Three real meals and water', 10],
    ['health', 'Mood and stress check-in (1 min)', 5],
    ['money', 'Log today\'s spending (1 min)', 5],
    ['money', 'Plan tomorrow\'s blocks (5 min)', 5],
    ['team', 'Reach out: ask in Community, message your captain or join a group', 10],
  ];
  const hid = [];
  for (const [c, t, p] of habits) hid.push((await q('insert into habit_templates(category,title,points) values($1,$2,$3) returning id', [c, t, p])).rows[0].id);

  // Last 14 days of activity for the demo student
  for (let i = 0; i < 14; i++) {
    const day = ymd(-i);
    const doneCount = i === 0 ? 5 : [9, 8, 7, 9, 6, 8, 10, 7, 5, 8, 9, 7, 8][i - 1] ?? 7;
    for (let h = 0; h < doneCount; h++) await q('insert into habit_logs values($1,$2,$3)', [demo, hid[h], day]);
    await q('insert into points_ledger(user_id,delta,reason,day) values($1,$2,$3,$4)', [demo, doneCount * 12, `seed:${day}`, day]);
    await q('insert into checkins values($1,$2,$3,$4,$5,$6)', [demo, day, 2 + (i % 3), 2 + ((i + 1) % 3), [7.5, 7.8, 6.2, 5.8, 6.5, 7, 6.0][i % 7], [30, 0, 45, 20, 30, 0, 60][i % 7]]);
    if (i % 7 < 5) for (const m of mods) await q('insert into attendance values($1,$2,$3,$4)', [demo, m, day, !(m === mods[2] && i === 3)]);
  }
  await q('insert into budgets values($1,$2,$3)', [demo, ymd().slice(0, 7), 350000]);
  for (const [cat, amt] of [['Food', 60000], ['Transport', 25000], ['Data', 15000], ['Books', 20000]]) {
    await q('insert into expenses(user_id,category,amount_cents,spent_on) values($1,$2,$3,$4)', [demo, cat, amt, ymd(-2)]);
  }

  // Season: per module 2 tests + 1 assignment (40% total) and an exam (60%)
  const marks = { 0: [68, 55, null], 1: [72, 64, null], 2: [48, 52, null] };
  for (let i = 0; i < mods.length; i++) {
    const m = mods[i];
    const rows = [['test', 'Test 1', 15, -20], ['assignment', 'Assignment 1', 10, -8], ['test', 'Test 2', 15, 12], ['exam', 'Semester exam', 60, 50]];
    for (let r = 0; r < rows.length; r++) {
      const [kind, title, weight, off] = rows[r];
      const a = (await q('insert into assessments(module_id,kind,title,weight,due_on) values($1,$2,$3,$4,$5) returning id', [m, kind, title, weight, ymd(off)])).rows[0].id;
      const score = marks[i][r];
      if (score != null) await q('insert into results values($1,$2,$3)', [demo, a, score]);
    }
    await q(`insert into benchmarks values($1,'pass',50),($1,'distinction',75)`, [m]);
    await q('insert into personal_targets values($1,$2,65)', [demo, m]);
  }

  // Three demo captains
  const caps = [['Thandi M.', 3, 0, true, 4.8, 90], ['Sipho K.', 4, 15000, false, 4.6, 94], ['Aisha P.', 2, 0, true, 4.5, 82]];
  for (const [name, yr, rate, free, rating, grade] of caps) {
    const u = (await q(`insert into users(email,password_hash,name,role,year_of_study) values($1,$2,$3,'captain',$4) returning id`, [`${name.split(' ')[0].toLowerCase()}@peaku.test`, hash, name, yr])).rows[0].id;
    await q('insert into captains values($1,$2,$3,$4,$5,6,$6)', [u, yr, rate, free, rating, 'Passed this module and enjoys explaining it.']);
    for (const m of mods) await q('insert into captain_modules values($1,$2,$3)', [u, m, grade]);
    for (let d = 1; d <= 4; d++) await q(`insert into captain_slots(captain_id,starts_at) values($1, (current_date + $2::int) + time '17:00')`, [u, d]);
  }
}
