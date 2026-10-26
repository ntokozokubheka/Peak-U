// "What do I need in the exam?" and course-mark maths.
const frac = (w) => (w > 1 ? w / 100 : w); // accepts 40 or 0.4

// needed = (target - courseMark * caWeight) / examWeight
export function neededExamMark({ courseMark, caWeight, examWeight, target }) {
  const ca = frac(caWeight), ex = frac(examWeight);
  if (!ex) throw new Error('examWeight must be greater than 0');
  const needed = (target - courseMark * ca) / ex;
  return { needed: Math.round(Math.max(0, needed) * 10) / 10, achievable: needed <= 100, secured: needed <= 0 };
}

// results: [{ score, max, weight }] for assessments already written.
// Returns the weighted average (0..100) of what has been written so far, or null.
export function courseMark(results) {
  const done = results.filter((r) => r.score != null);
  const w = done.reduce((s, r) => s + Number(r.weight), 0);
  if (!w) return null;
  return done.reduce((s, r) => s + (Number(r.score) / Number(r.max)) * 100 * Number(r.weight), 0) / w;
}
