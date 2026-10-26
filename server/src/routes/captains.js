// Find and book captains (student mentors). Ranking lives in logic/captainMatch.js
import { Router } from 'express';
import { query, pool } from '../db.js';
import { wrap } from '../util/wrap.js';
import { rankCaptains } from '../logic/captainMatch.js';

const router = Router();

router.get('/', wrap(async (req, res) => {
  const moduleId = Number(req.query.moduleId);
  const level = ['peer', 'pro', 'sponsored', 'solo'].includes(req.query.level) ? req.query.level : 'peer';
  if (level === 'solo') return res.json({ captains: [], note: 'Going solo: your coach covers you.' });
  if (!moduleId) return res.status(400).json({ error: 'moduleId is required' });
  const { rows } = await query(
    `select c.user_id as id, u.name, c.year_of_study as year, c.free_peer, c.rate_cents, c.rating::float, c.weekly_cap, c.bio,
            cm.verified_grade::float as verified_grade,
            (select count(*)::int from captain_slots s where s.captain_id = c.user_id and not s.taken and s.starts_at > now()) as open_slots,
            (select count(*)::int from bookings b where b.captain_id = c.user_id and b.created_at > now() - interval '7 days') as booked_hours
     from captains c join users u on u.id = c.user_id
     join captain_modules cm on cm.captain_id = c.user_id and cm.module_id = $1`, [moduleId]);
  const captains = rows.map((r) => ({
    id: r.id, name: r.name, year: r.year, bio: r.bio, freePeer: r.free_peer, rateCents: r.rate_cents, rating: r.rating,
    weeklyCap: r.weekly_cap, verifiedGrade: r.verified_grade, openSlots: r.open_slots, bookedHours: r.booked_hours,
  }));
  res.json({ captains: rankCaptains(captains, { level, budgetCents: Number(req.query.budgetCents) || 0 }) });
}));

router.get('/:id/slots', wrap(async (req, res) => {
  const { rows } = await query(`select id, starts_at from captain_slots where captain_id = $1 and not taken and starts_at > now() order by starts_at`, [req.params.id]);
  res.json({ slots: rows });
}));

router.post('/book', wrap(async (req, res) => {
  const { captainId, moduleId, slotId } = req.body || {};
  const client = await pool.connect();
  try {
    await client.query('begin');
    const slot = (await client.query('select * from captain_slots where id = $1 and captain_id = $2 and not taken for update', [slotId, captainId])).rows[0];
    if (!slot) { await client.query('rollback'); return res.status(409).json({ error: 'That slot was just taken. Pick another.' }); }
    const cap = (await client.query('select free_peer from captains where user_id = $1', [captainId])).rows[0];
    await client.query('update captain_slots set taken = true where id = $1', [slotId]);
    const b = await client.query(
      `insert into bookings(student_id,captain_id,module_id,slot_id,paid_with) values($1,$2,$3,$4,$5) returning id`,
      [req.user.id, captainId, moduleId, slotId, cap?.free_peer ? 'free' : 'money']);   // payments: plug Stripe or Paystack in here
    await client.query('commit');
    res.json({ ok: true, bookingId: b.rows[0].id, startsAt: slot.starts_at });
  } catch (e) { await client.query('rollback'); throw e; } finally { client.release(); }
}));

export default router;
