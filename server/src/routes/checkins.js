import { Router } from 'express';
import { query } from '../db.js';
import { ymd } from '../util/dates.js';
import { wrap } from '../util/wrap.js';

const router = Router();
const within = (n, lo, hi) => Number.isFinite(n) && n >= lo && n <= hi;

// One check-in per day (saving again updates it).
router.post('/', wrap(async (req, res) => {
  const { mood, stress, sleepHours, movementMinutes } = req.body || {};
  if (!within(+mood, 1, 5) || !within(+stress, 1, 5)) return res.status(400).json({ error: 'Mood and stress must be 1 to 5' });
  if (!within(+sleepHours, 0, 24) || !within(+movementMinutes, 0, 600)) return res.status(400).json({ error: 'Check sleep and movement values' });
  await query(
    `insert into checkins values($1,$2,$3,$4,$5,$6)
     on conflict (user_id, day) do update set mood = $3, stress = $4, sleep_hours = $5, movement_minutes = $6`,
    [req.user.id, ymd(), mood, stress, sleepHours, movementMinutes]);
  res.json({ ok: true });
}));

export default router;
