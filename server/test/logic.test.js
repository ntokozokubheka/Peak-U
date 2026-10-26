import test from 'node:test';
import assert from 'node:assert/strict';
import { computeFormScore, labelFor, mindScore, classScore, bodyScore, moneyScore } from '../src/logic/formScore.js';
import { neededExamMark, courseMark } from '../src/logic/examNeeded.js';
import { compare } from '../src/logic/benchmarks.js';
import { allowedPoints, streak } from '../src/logic/points.js';
import { rankCaptains } from '../src/logic/captainMatch.js';

test('form score matches the worked example (77.8 -> 78, steady)', () => {
  const r = computeFormScore({ pillars: { mind: 74, class: 92, body: 70, money: 80 }, daysWithData: 6, prevScore: 81 });
  assert.equal(r.raw, 77.8); assert.equal(r.score, 78); assert.equal(r.trend, -3); assert.equal(r.label, 'steady'); assert.equal(r.partial, false);
});
test('labels use trend as well as score', () => {
  assert.equal(labelFor(85, 0), 'peak');
  assert.equal(labelFor(85, -3), 'steady');   // high score but slipping
  assert.equal(labelFor(70, -9), 'declining'); // fine score, steep drop
  assert.equal(labelFor(50, 0), 'declining');
  assert.equal(labelFor(80, null), 'peak');
});
test('not enough data shows "building"', () => {
  assert.equal(computeFormScore({ pillars: { mind: 80, class: 80, body: 80, money: 80 }, daysWithData: 3 }).label, 'building');
  assert.equal(computeFormScore({ pillars: { mind: 80, class: null, body: null, money: null }, daysWithData: 7 }).label, 'building');
});
test('missing or paused pillars share their weight and mark the score partial', () => {
  const r = computeFormScore({ pillars: { mind: 80, class: 60, body: null, money: null }, daysWithData: 5 });
  assert.equal(r.partial, true); assert.equal(r.score, Math.round((80 * 0.35 + 60 * 0.2) / 0.55));
  const p = computeFormScore({ pillars: { mind: 80, class: 60, body: 40, money: 90 }, daysWithData: 5, paused: ['body'] });
  assert.equal(p.partial, true); assert.deepEqual(p.missing, ['body']);
});
test('pillar scorers', () => {
  assert.equal(classScore({ attended: 11, total: 12 }).toFixed(1), '91.7');
  assert.equal(classScore({ total: 0 }), null);
  assert.equal(bodyScore({ sleepAvg: 7.5, movementAvg: 30, moodAvg: 5, stressAvg: 1 }), 100);
  assert.ok(bodyScore({ sleepAvg: 6 }) < 85);
  assert.equal(moneyScore({ spent: 50, budget: 100, daysElapsed: 15, daysInPeriod: 30 }), 100);
  assert.ok(moneyScore({ spent: 80, budget: 100, daysElapsed: 15, daysInPeriod: 30 }) < 100);
  assert.equal(mindScore({ gradeAvg: 80, lateCount: 2 }), 70);
  assert.equal(mindScore({}), null);
});
test('exam needed: (65 - 62*0.40) / 0.60 = 67.0', () => {
  assert.equal(neededExamMark({ courseMark: 62, caWeight: 40, examWeight: 60, target: 65 }).needed, 67);
  assert.equal(neededExamMark({ courseMark: 62, caWeight: 0.4, examWeight: 0.6, target: 50 }).needed, 42);
  const u = neededExamMark({ courseMark: 20, caWeight: 0.4, examWeight: 0.6, target: 75 });
  assert.equal(u.achievable, false);
  assert.equal(neededExamMark({ courseMark: 90, caWeight: 0.4, examWeight: 0.6, target: 30 }).secured, true); // 36 points already banked
});
test('course mark is a weighted average of written assessments', () => {
  const m = courseMark([{ score: 68, max: 100, weight: 15 }, { score: 55, max: 100, weight: 10 }, { score: null, max: 100, weight: 15 }]);
  assert.equal(Math.round(m * 10) / 10, 62.8);
  assert.equal(courseMark([{ score: null, max: 100, weight: 10 }]), null);
});
test('benchmark comparison', () => {
  assert.equal(compare({ mark: 68, target: 65, last: 64 }).status, 'on_target');
  assert.equal(compare({ mark: 55, target: 65 }).status, 'below_target');
  assert.equal(compare({ mark: 45, target: 65, pass: 50 }).status, 'below_pass');
  assert.equal(compare({ mark: null, target: 65 }).status, 'upcoming');
  assert.equal(compare({ mark: 68, target: 65, last: 66 }).delta, 2);
});
test('daily points cap', () => {
  assert.equal(allowedPoints(0, 30), 30);
  assert.equal(allowedPoints(190, 30), 10);
  assert.equal(allowedPoints(200, 30), 0);
});
test('streak counts days with 7+ items, with grace for today', () => {
  const d = (day, done) => ({ day, done });
  const days = [d('2026-10-21', 3), d('2026-10-20', 9), d('2026-10-19', 8), d('2026-10-18', 7), d('2026-10-17', 6), d('2026-10-16', 12)];
  assert.equal(streak(days, '2026-10-21'), 3);                      // today not done yet, still 3
  assert.equal(streak([d('2026-10-21', 8), ...days.slice(1)], '2026-10-21'), 4);
  assert.equal(streak([], '2026-10-21'), 0);
});
test('captain ranking filters and orders', () => {
  const base = { weeklyCap: 6, bookedHours: 0, openSlots: 3, rating: 4.5 };
  const list = [
    { id: 1, ...base, freePeer: true, rateCents: 0, verifiedGrade: 80 },
    { id: 2, ...base, freePeer: true, rateCents: 0, verifiedGrade: 90 },
    { id: 3, ...base, freePeer: false, rateCents: 9000, verifiedGrade: 95 },
    { id: 4, ...base, freePeer: true, rateCents: 0, verifiedGrade: null },
    { id: 5, ...base, freePeer: true, rateCents: 0, verifiedGrade: 99, bookedHours: 6 },
  ];
  assert.deepEqual(rankCaptains(list, { level: 'peer' }).map((c) => c.id), [2, 1]);
  assert.equal(rankCaptains(list, { level: 'pro', budgetCents: 10000 }).some((c) => c.id === 3), true); // paid captain allowed within budget
  assert.equal(rankCaptains(list, { level: 'pro', budgetCents: 5000 }).some((c) => c.id === 3), false);
});
