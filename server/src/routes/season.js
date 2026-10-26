// Quarter tests, assignments and semester exams, with benchmarks and the exam calculator.
import { Router } from 'express';
import { query } from '../db.js';
import { wrap } from '../util/wrap.js';
import { courseMark, neededExamMark } from '../logic/examNeeded.js';
import { compare } from '../logic/benchmarks.js';

const router = Router();
const DEFAULT_TARGET = 65, DEFAULT_PASS = 50;   // CUSTOMIZE
const r1 = (n) => (n == null ? null : Math.round(n * 10) / 10);

router.get('/', wrap(async (req, res) => {
  const uid = req.user.id;
  const [{ rows }, bm, tg] = await Promise.all([
    query(`select a.id, a.module_id, m.name as module, a.kind, a.title, a.weight::float, a.max_score::float,
                  to_char(a.due_on,'YYYY-MM-DD') as due_on, r.score::float as score
           from assessments a join modules m on m.id = a.module_id
           left join results r on r.assessment_id = a.id and r.user_id = $1
           order by a.module_id, a.due_on`, [uid]),
    query(`select module_id, kind, value::float from benchmarks`),
    query(`select module_id, target::float from personal_targets where user_id = $1`, [uid]),
  ]);
  const byModule = new Map();
  for (const a of rows) { if (!byModule.has(a.module_id)) byModule.set(a.module_id, []); byModule.get(a.module_id).push(a); }

  const modules = [...byModule.entries()].map(([moduleId, list]) => {
    const target = tg.rows.find((t) => t.module_id === moduleId)?.target ?? DEFAULT_TARGET;
    const pass = bm.rows.find((b) => b.module_id === moduleId && b.kind === 'pass')?.value ?? DEFAULT_PASS;
    const ca = list.filter((a) => a.kind !== 'exam');
    const exam = list.find((a) => a.kind === 'exam');
    const caWeight = ca.reduce((s, a) => s + a.weight, 0);
    const examWeight = exam ? exam.weight : 100 - caWeight;
    const mark = courseMark(ca.map((a) => ({ score: a.score, max: a.max_score, weight: a.weight })));
    const calc = (t) => (mark == null ? null : neededExamMark({ courseMark: mark, caWeight, examWeight, target: t }));
    return {
      moduleId, module: list[0].module, courseMark: r1(mark), caWeight, examWeight, target, pass,
      neededForTarget: calc(target), neededToPass: calc(pass),
      assessments: list.map((a) => {
        const pct = a.score == null ? null : (a.score / a.max_score) * 100;
        return { id: a.id, title: a.title, kind: a.kind, weight: a.weight, dueOn: a.due_on, pct: r1(pct), ...compare({ mark: pct, target, pass }) };
      }),
    };
  });
  res.json({ modules });
}));

router.post('/target', wrap(async (req, res) => {
  const { moduleId, target } = req.body || {};
  if (!(target >= 0 && target <= 100)) return res.status(400).json({ error: 'Target must be 0 to 100' });
  await query(`insert into personal_targets values($1,$2,$3) on conflict (user_id, module_id) do update set target = $3`, [req.user.id, moduleId, target]);
  res.json({ ok: true });
}));

router.post('/exam-needed', (req, res) => {
  const { courseMark: cm, caWeight, examWeight, target } = req.body || {};
  if ([cm, caWeight, examWeight, target].some((v) => !Number.isFinite(Number(v)))) return res.status(400).json({ error: 'All four numbers are required' });
  try { res.json(neededExamMark({ courseMark: +cm, caWeight: +caWeight, examWeight: +examWeight, target: +target })); }
  catch (e) { res.status(400).json({ error: e.message }); }
});

export default router;
