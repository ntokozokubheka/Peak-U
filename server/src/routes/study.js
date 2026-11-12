// Study Lab: scan a problem, similar problem, practice paper. All go through the OpenAI Coach AI.
import { Router } from 'express';
import { query } from '../db.js';
import { wrap } from '../util/wrap.js';
import { ymd } from '../util/dates.js';
import { breakdownProblem, similarProblem, generatePaper, hasKey } from '../ai/coach.js';

const router = Router();
const LIMIT = Number(process.env.AI_DAILY_LIMIT || 30);
const used = new Map();   // in memory: resets on restart. For production use the database or Redis.

function limit(req, res, next) {
  const key = `${req.user.id}:${ymd()}`;
  const n = (used.get(key) || 0) + 1;
  if (n > LIMIT) return res.status(429).json({ error: `Daily limit of ${LIMIT} coach requests reached. Back tomorrow.` });
  used.set(key, n); next();
}
const TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

router.get('/status', (_req, res) => res.json({ aiConfigured: hasKey(), dailyLimit: LIMIT }));

router.post('/scan', limit, wrap(async (req, res) => {
  const { imageBase64, mediaType, text, taskType, helpMode, attempt } = req.body || {};
  if (!imageBase64 && !text) return res.status(400).json({ error: 'Add a photo or type the question' });
  if (imageBase64 && (imageBase64.length > 7_000_000 || !TYPES.includes(mediaType))) return res.status(400).json({ error: 'Use a JPG, PNG or WebP image under about 5 MB' });
  const result = await breakdownProblem({ imageBase64, mediaType, text, taskType, helpMode, attempt });
  const saved = await query('insert into problem_scans(user_id,kind,topic,result) values($1,$2,$3,$4) returning id', [req.user.id, result.taskType, result.topic, result]);
  res.json({ ...result, scanId: saved.rows[0].id });
}));

router.post('/similar', limit, wrap(async (req, res) => res.json(await similarProblem(req.body || {}))));

router.post('/paper', limit, wrap(async (req, res) => {
  const { moduleName, minutes } = req.body || {};
  if (!moduleName) return res.status(400).json({ error: 'Pick a module' });
  res.json(await generatePaper({ moduleName, minutes: Number(minutes) || 120 }));
}));

router.get('/modules', wrap(async (_req, res) => res.json({ modules: (await query('select id, code, name from modules order by id')).rows })));

export default router;