// Gathers the numbers for each pillar from the database, then hands them to the pure math in logic/formScore.js
import { query } from '../db.js';
import { addDays, daysInMonth } from '../util/dates.js';
import { mindScore, classScore, bodyScore, moneyScore, computeFormScore, RULES } from '../logic/formScore.js';

const num = (v) => (v == null ? null : Number(v));

export async function pillarsFor(userId, endDay, windowDays = RULES.windowDays) {
  const start = addDays(endDay, -(windowDays - 1));
  const monthStart = endDay.slice(0, 8) + '01';
  const [grades, study, studyN, att, chk, bud, exp, data] = await Promise.all([
    query(`select avg(r.score / x.max_score * 100) as avg from results r join assessments x on x.id = r.assessment_id
           where r.user_id = $1 and x.due_on <= $2 and x.due_on > $2::date - 30`, [userId, endDay]),
    query(`select count(*)::int as n from habit_logs l join habit_templates t on t.id = l.habit_id
           where l.user_id = $1 and t.category = 'study' and l.day between $2 and $3`, [userId, start, endDay]),
    query(`select count(*)::int as n from habit_templates where category = 'study'`),
    query(`select count(*) filter (where attended)::int as attended, count(*)::int as total from attendance
           where user_id = $1 and day between $2 and $3`, [userId, start, endDay]),
    query(`select avg(sleep_hours) as sleep, avg(movement_minutes) as move, avg(mood) as mood, avg(stress) as stress
           from checkins where user_id = $1 and day between $2 and $3`, [userId, start, endDay]),
    query(`select amount_cents from budgets where user_id = $1 and month = $2`, [userId, endDay.slice(0, 7)]),
    query(`select coalesce(sum(amount_cents), 0)::int as spent from expenses where user_id = $1 and spent_on between $2 and $3`, [userId, monthStart, endDay]),
    query(`select count(distinct day)::int as n from (
             select day from habit_logs where user_id = $1 and day between $2 and $3
             union select day from checkins where user_id = $1 and day between $2 and $3
             union select day from attendance where user_id = $1 and day between $2 and $3) x`, [userId, start, endDay]),
  ]);
  const c = chk.rows[0];
  const pillars = {
    mind: mindScore({ gradeAvg: num(grades.rows[0].avg), blocksDone: study.rows[0].n, blocksPlanned: studyN.rows[0].n * windowDays }),
    class: classScore(att.rows[0]),
    body: bodyScore({ sleepAvg: num(c.sleep), movementAvg: num(c.move), moodAvg: num(c.mood), stressAvg: num(c.stress) }),
    money: moneyScore({
      spent: bud.rows[0] ? exp.rows[0].spent : null, budget: bud.rows[0]?.amount_cents,
      daysElapsed: Number(endDay.slice(8)), daysInPeriod: daysInMonth(endDay),
    }),
  };
  return { pillars, daysWithData: data.rows[0].n };
}

export async function scoreFor(userId, today) {
  const [cur, prev] = await Promise.all([pillarsFor(userId, today), pillarsFor(userId, addDays(today, -7))]);
  const last = computeFormScore({ ...prev, prevScore: null });
  const result = computeFormScore({ ...cur, prevScore: last.score });
  const rounded = Object.fromEntries(Object.entries(cur.pillars).map(([k, v]) => [k, v == null ? null : Math.round(v)]));
  return { ...result, pillars: rounded, daysWithData: cur.daysWithData };
}
