// Today's training: 12 checklist items, points, streak.
import { Router } from 'express';
import { query, pool } from '../db.js';
import { ymd } from '../util/dates.js';
import { wrap } from '../util/wrap.js';
import { allowedPoints, streak } from '../logic/points.js';

const router = Router();

router.get('/today', wrap(async (req, res) => {
  const { rows } = await query(
    `select t.id, t.category, t.title, t.points, (l.habit_id is not null) as done
     from habit_templates t left join habit_logs l on l.habit_id = t.id and l.user_id = $1 and l.day = $2
     order by t.id`, [req.user.id, ymd()]);
  res.json({ items: rows });
}));

router.post('/:id/toggle', wrap(async (req, res) => {
  const uid = req.user.id, id = Number(req.params.id), day = ymd();
  const client = await pool.connect();
  try {
    await client.query('begin');
    const t = (await client.query('select * from habit_templates where id = $1', [id])).rows[0];
    if (!t) { await client.query('rollback'); return res.status(404).json({ error: 'Unknown item' }); }
    const reason = `habit:${id}:${day}`;
    const had = await client.query('select 1 from habit_logs where user_id = $1 and habit_id = $2 and day = $3', [uid, id, day]);
    if (had.rowCount) {                       // un-tick: remove the log and its points
      await client.query('delete from habit_logs where user_id = $1 and habit_id = $2 and day = $3', [uid, id, day]);
      await client.query('delete from points_ledger where user_id = $1 and reason = $2', [uid, reason]);
    } else {                                  // tick: log it and award points, respecting the daily cap
      await client.query('insert into habit_logs values($1,$2,$3)', [uid, id, day]);
      const total = (await client.query(`select coalesce(sum(delta),0)::int as total from points_ledger where user_id = $1 and day = $2 and reason like 'habit:%'`, [uid, day])).rows[0].total;
      await client.query('insert into points_ledger(user_id,delta,reason,day) values($1,$2,$3,$4)', [uid, allowedPoints(total, t.points), reason, day]);
    }
    await client.query('commit');
    res.json({ ok: true });
  } catch (e) { await client.query('rollback'); throw e; } finally { client.release(); }
}));

router.get('/summary', wrap(async (req, res) => {
  const uid = req.user.id, today = ymd();
  const [bal, done, pts, days] = await Promise.all([
    query('select coalesce(sum(delta),0)::int as balance from points_ledger where user_id = $1', [uid]),
    query('select count(*)::int as done from habit_logs where user_id = $1 and day = $2', [uid, today]),
    query('select coalesce(sum(delta),0)::int as points from points_ledger where user_id = $1 and day = $2', [uid, today]),
    query(`select to_char(day,'YYYY-MM-DD') as day, count(*)::int as done from habit_logs
           where user_id = $1 and day > $2::date - 60 group by day`, [uid, today]),
  ]);
  res.json({ balance: bal.rows[0].balance, today: { done: done.rows[0].done, points: pts.rows[0].points }, streak: streak(days.rows, today) });
}));

export default router;
